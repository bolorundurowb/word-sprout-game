using FluentValidation;
using WordSproutApi.Requests;

namespace WordSproutApi.Validators;

public class JoinGameReqValidator : AbstractValidator<JoinGameReq>
{
    public JoinGameReqValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("User name is required");
    }
}
