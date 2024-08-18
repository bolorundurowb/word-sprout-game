using Microsoft.AspNetCore.Mvc;
using WordSproutApi.Responses;

namespace WordSproutApi.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    [NonAction]
    public BadRequestObjectResult BadRequest(string message) => BadRequest(new GenericRes(message));

    [NonAction]
    public ConflictObjectResult Conflict(string message) => Conflict(new GenericRes(message));

    [NonAction]
    public NotFoundObjectResult NotFound(string message) => NotFound(new GenericRes(message));
}
