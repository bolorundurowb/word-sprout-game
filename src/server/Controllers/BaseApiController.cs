using Microsoft.AspNetCore.Mvc;
using WordSproutApi.Responses;

namespace WordSproutApi.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    [NonAction]
    protected BadRequestObjectResult BadRequest(string message) => BadRequest(new GenericRes(message));

    [NonAction]
    protected ConflictObjectResult Conflict(string message) => Conflict(new GenericRes(message));

    [NonAction]
    protected NotFoundObjectResult NotFound(string message) => NotFound(new GenericRes(message));

    [NonAction]
    protected ForbidResult Forbidden() => new();
}
