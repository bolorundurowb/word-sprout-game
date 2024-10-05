using AutoMapper;
using meerkat;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using WordSproutApi.Enums;
using WordSproutApi.Hubs;
using WordSproutApi.Models;
using WordSproutApi.Requests;
using WordSproutApi.Responses;

namespace WordSproutApi.Controllers.V1;

[Route("api/v1/games")]
public class GamesController(IMapper mapper, IHubContext<GameHub, IGameHubClient> gameHub) : BaseApiController
{
    [HttpGet("{gameCode}")]
    [ProducesResponseType(typeof(GameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> GetByCode(string gameCode)
    {
        var game = await GetActiveOrAwaiting(gameCode);

        if (game == null)
            return NotFound("Game does not exist");

        return Ok(mapper.Map<GameRes>(game));
    }

    [HttpPost("")]
    [ProducesResponseType(typeof(GameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    public async Task<IActionResult> Create([FromBody] CreateGameReq req)
    {
        var game = new Game(req.UserName, req.MaxIntervalBetweenRoundsInSecs, req.MaxRoundDurationInSecs, req.Columns,
            req.CharacterSet);
        await game.SaveAsync();

        return Ok(mapper.Map<GameRes>(game));
    }

    [HttpPost("{gameCode}/join")]
    [ProducesResponseType(typeof(GameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> JoinGame(string gameCode, [FromBody] JoinGameReq req)
    {
        var game = await GetActiveOrAwaiting(gameCode);

        if (game == null)
            return NotFound("Game does not exist");

        if (game.Players.Any(x => x.UserName == req.UserName.Trim().ToLowerInvariant()))
            return Conflict("A player with that username already exists for this game");

        game.AddPlayer(req.UserName);
        await game.SaveAsync();

        // notify the other users that there is a new player
        await gameHub.Clients.All.PlayerJoined(gameCode, req.UserName);

        return Ok(mapper.Map<GameRes>(game));
    }

    [HttpPost("{gameCode}/start")]
    [ProducesResponseType(typeof(GameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> StartGame(string gameCode)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.AwaitingPlayers)
            return BadRequest("Only games awaiting players can be started");

        if (game.Players.Count < 2)
            return BadRequest("At least 2 players are required to start the game");

        game.Start();
        await game.SaveAsync();

        // notify the other users that the game is started and the countdown should start
        await gameHub.Clients.All.GameStarted(gameCode);
        await gameHub.Clients.All.RoundCountdownInitiated(gameCode, game.State.CurrentPlayer!);

        return Ok(mapper.Map<GameRes>(game));
    }

    [HttpPost("{gameCode}/start-round")]
    [ProducesResponseType(typeof(GameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> StartRound(string gameCode, [FromBody] StartRoundReq req)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.Active)
            return BadRequest("Rounds can only be started in active games");

        game.StartRound(req.Character);
        await game.SaveAsync();

        // notify the other users that the game is started and the countdown should start
        await gameHub.Clients.All.RoundStarted(gameCode, req.PlayerUsername, req.Character);

        return Ok(mapper.Map<GameRes>(game));
    }

    [HttpGet("{gameCode}/state")]
    [ProducesResponseType(typeof(GameStateRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> GetGameState(string gameCode)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.Active)
            return BadRequest("Only active games can provide state");

        return Ok(mapper.Map<GameStateRes>(game.State));
    }

    [HttpGet("{gameCode}/players/{userName}/plays")]
    [ProducesResponseType(typeof(Dictionary<char, Dictionary<string, string?>>), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 403)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> GetPlays(string gameCode, string userName)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is GameStatus.AwaitingPlayers)
            return BadRequest("There are no plays for this game");

        var player = game.Players.FirstOrDefault(x => x.UserName == userName);

        if (player == null)
            return Forbidden();

        var response = player.Plays.ToDictionary(x => x.Character, y => y.ColumnValues);
        return Ok(response);
    }

    [HttpPost("{gameCode}/players/{userName}/plays")]
    [ProducesResponseType(typeof(Play), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 403)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> SubmitPlay(string gameCode, string userName, [FromBody] SubmitPlayReq req)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.Active)
            return BadRequest("Only active games can accept plays");

        var player = game.Players.FirstOrDefault(x => x.UserName == userName);

        if (player == null)
            return Forbidden();

        var isRoundComptroller = game.State.CurrentPlayer == userName;
        var play = player.AddPlay(req.Character, req.ColumnValues);

        if (isRoundComptroller)
            game.State.MarkAsAwaitingScoring();

        await game.SaveAsync();

        await gameHub.Clients.All.RoundPlaySubmitted(gameCode, userName, req.Character, req.ColumnValues);

        // if the play is submitted by the current player, then the round is over
        if (game.State.CurrentPlayer == userName)
            await gameHub.Clients.All.RoundEnded(gameCode, req.Character);

        return Ok(play);
    }

    [HttpPost("{gameCode}/score-round")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 403)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> ScoreRound(string gameCode, [FromBody] ScoreRoundReq req)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.Active)
            return BadRequest("Only active games can accept play scores");

        if (game.State.CurrentPlayer != req.Username)
            return Forbidden();

        foreach (var playerScore in req.PlayerScores)
        {
            var player = game.Players.FirstOrDefault(x => x.UserName == playerScore.Key);

            if (player is null)
                throw new InvalidOperationException($"Player {playerScore.Key} not found in game {gameCode}");

            player.ScorePlay(req.Character, playerScore.Value);
        }

        game.SetStateForNextRound();
        await game.SaveAsync();

        if (game.IsGameOver())
        {
            // clear the round status
            game.State.ClearStatus();
            await game.SaveAsync();

            // compute all player scores
            var playerScores = game.Players
                .Select(x => new { x.UserName, GameScore = x.Plays.Sum(y => y.Score) })
                .OrderByDescending(x => x.GameScore)
                .ToDictionary(x => x.UserName, y => y.GameScore);

            // determine the winners
            var maxScore = playerScores.Values.Max();
            var winners = playerScores
                .Where(pair => pair.Value == maxScore)
                .Select(x => x.Key)
                .ToList();

            // notify all users that the game is over and share the winning details
            await gameHub.Clients.All.GameOver(gameCode, winners, playerScores);
        }
        else
        {
            // notify the other users that a new round countdown should be started
            await gameHub.Clients.All.RoundCountdownInitiated(gameCode, game.State.CurrentPlayer!);
        }

        return Ok();
    }

    private static Task<Game?> GetActiveOrAwaiting(string gameCode) => Meerkat.FindOneAsync<Game>(x =>
        x.Code == gameCode && (x.Status == GameStatus.AwaitingPlayers || x.Status == GameStatus.Active));
}