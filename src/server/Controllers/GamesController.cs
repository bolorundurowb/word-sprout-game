using meerkat;
using Microsoft.AspNetCore.Mvc;
using WordSproutApi.Enums;
using WordSproutApi.Models;
using WordSproutApi.Requests;
using WordSproutApi.Responses;

namespace WordSproutApi.Controllers;

[ApiController]
[Route("api/v1/games")]
public class GamesController : ControllerBase
{
    [HttpPost("check")]
    [ProducesResponseType(typeof(CheckGameRes), 200)]
    [ProducesResponseType(typeof(GenericRes), 400)]
    public async Task<IActionResult> Check([FromBody] CheckGameReq req)
    {
        var activeGameExists = await Meerkat.ExistsAsync<Game>(x => x.Code == req.Code && x.Status == GameStatus.Active);
        return Ok(new CheckGameRes(activeGameExists));
    }
}
