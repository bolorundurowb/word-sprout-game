using FluentValidation;
using WordSproutApi.Requests;

namespace WordSproutApi.Validators;

public class StartRoundReqValidator : AbstractValidator<StartRoundReq>
{
    public StartRoundReqValidator()
    {
        RuleFor(x => x.PlayerUsername)
            .NotEmpty()
            .WithMessage("Player username cannot be empty");
    }
}
