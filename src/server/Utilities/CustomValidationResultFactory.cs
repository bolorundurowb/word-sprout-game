using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Results;
using WordSproutApi.Responses;

namespace WordSproutApi.Utilities;

public class CustomValidationResultFactory : IFluentValidationAutoValidationResultFactory
{
    public IActionResult CreateActionResult(ActionExecutingContext context,ValidationProblemDetails? validationProblemDetails)
    {
        var errors = (validationProblemDetails?.Errors
            .Select(x =>
            {
                var errorMessage = $"{x.Key}: {string.Join(Environment.NewLine, x.Value)}";
                return new GenericRes(errorMessage);
            }) ?? []).ToList();

        return new BadRequestObjectResult(new { Errors = errors });
    }
}
