using FluentValidation;
using WordSproutApi.Requests;

namespace WordSproutApi.Validators;

public class CreateGameReqValidator : AbstractValidator<CreateGameReq>
{
    public CreateGameReqValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("User name is required");
        
        RuleFor(x => x.Columns)
            .NotEmpty()
            .WithMessage("At least one column is required");
        
        RuleFor(x => x.CharacterSet)
            .NotEmpty()
            .WithMessage("Character set is required");

        RuleFor(x => x.MaxRoundDurationInSecs)
            .GreaterThanOrEqualTo(5)
            .LessThanOrEqualTo(60);

        RuleFor(x => x.MaxIntervalBetweenRoundsInSecs)
            .GreaterThan(0)
            .LessThanOrEqualTo(30);
    }
}
