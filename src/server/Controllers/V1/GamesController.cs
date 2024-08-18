using meerkat;
using Microsoft.AspNetCore.Mvc;
using WordSproutApi.Enums;
using WordSproutApi.Models;
using WordSproutApi.Requests;
using WordSproutApi.Responses;

namespace WordSproutApi.Controllers.V1;

[Route("api/v1/games")]
public class GamesController : BaseApiController
{
    [HttpPost("check")]
    [ProducesResponseType(typeof(CheckGameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    public async Task<IActionResult> Check([FromBody] CheckGameReq req)
    {
        var activeGameExists = await Meerkat.ExistsAsync<Game>(x =>
            x.Code == req.Code && x.Status == GameStatus.AwaitingPlayers || x.Status == GameStatus.Active);
        return Ok(new CheckGameRes(activeGameExists));
    }

    [HttpGet("{gameCode}")]
    [ProducesResponseType(typeof(Game), 200)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> GetById(string gameCode)
    {
        var game = await Meerkat.FindOneAsync<Game>(x =>
            x.Code == gameCode && x.Status == GameStatus.AwaitingPlayers || x.Status == GameStatus.Active);

        if (game == null)
            return NotFound("Game does not exist");

        return Ok(game);
    }

    [HttpPost("")]
    [ProducesResponseType(typeof(Game), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    public async Task<IActionResult> Create([FromBody] CreateGameReq req)
    {
        var game = new Game(req.UserName, req.MaxIntervalBetweenRoundsInSecs, req.MaxRoundDurationInSecs, req.Columns,
            req.CharacterSet);
        await game.SaveAsync();

        return Ok(game);
    }
}
