using FluentValidation;
using WordSproutApi.Requests;

namespace WordSproutApi.Validators;

public class ScoreRoundReqValidator : AbstractValidator<ScoreRoundReq>
{
    public ScoreRoundReqValidator()
    {
        RuleFor(x => x.Character)
            .NotEmpty();

        RuleFor(x => x.Username)
            .NotNull()
            .NotEmpty();

        RuleFor(x => x.PlayerScores)
            .NotNull();
    }
}
