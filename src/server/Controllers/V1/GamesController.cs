﻿using AutoMapper;
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
        var game = await Meerkat.FindOneAsync<Game>(x =>
            x.Code == gameCode && x.Status == GameStatus.AwaitingPlayers || x.Status == GameStatus.Active);

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
        var game = await Meerkat.FindOneAsync<Game>(x =>
            x.Code == gameCode && x.Status == GameStatus.AwaitingPlayers || x.Status == GameStatus.Active);

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
        await gameHub.Clients.All.RoundCountdownInitiated(gameCode, game.State!.CurrentPlayer);

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
    [ProducesResponseType(typeof(GameState), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> GetGameState(string gameCode)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.Active)
            return BadRequest("Only active games can provide state");

        return Ok(game.State);
    }

    [HttpGet("{gameCode}/players/{userName}/plays")]
    [ProducesResponseType(typeof(Play), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    [ProducesResponseType(typeof(GenericRes), 401)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> SubmitPLay(string gameCode, string userName, [FromBody] SubmitPlayReq req)
    {
        var game = await Meerkat.FindOneAsync<Game>(x => x.Code == gameCode);

        if (game == null)
            return NotFound("Game with that code does not exist");

        if (game.Status is not GameStatus.Active)
            return BadRequest("Only active games can accept plays");

        var player = game.Players.FirstOrDefault(x => x.UserName == userName);

        if (player == null)
            return Unauthorized();

        var play = player.AddPlay(req.Character, req.ColumnValues);
        await game.SaveAsync();
        
        // if the play is submitted by the current player, then the round is over
        if (game.State!.CurrentPlayer == userName)
        {
            var playMap = new Dictionary<string, Play>();

            foreach (var gamePlayer in game.Players)
            {
                var playerPlay = gamePlayer.Plays.First(x => x.Character == req.Character);
                playMap.Add(gamePlayer.UserName, playerPlay);
            }
            
            await gameHub.Clients.All.RoundEnded(gameCode, playMap);
        }

        return Ok(play);
    }
}
