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
    [HttpPost("{gameCode}/join")]
    [ProducesResponseType(typeof(GameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 404)]
    public async Task<IActionResult> JoinGame(string gameCode, [FromBody] JoinGameReq req)
    {
        var game = await Meerkat.FindOneAsync<Game>(x =>
            x.Code == gameCode && x.Status == GameStatus.AwaitingPlayers || x.Status == GameStatus.Active);

        if (game == null)
            return NotFound("Game does not exist");
        
        game.AddPlayer(req.UserName);
        await game.SaveAsync();
        
        // notify the other users that there is a new player
        await gameHub.Clients.All.PlayerJoined(req.UserName);

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
}
