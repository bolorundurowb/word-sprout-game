using FluentValidation;
using WordSproutApi.Requests;

namespace WordSproutApi.Validators;

public class CheckGameReqValidator : AbstractValidator<CheckGameReq>
{
    public CheckGameReqValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Game code is required");
    }
}
