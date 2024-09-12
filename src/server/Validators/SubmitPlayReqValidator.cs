using FluentValidation;
using WordSproutApi.Requests;

namespace WordSproutApi.Validators;

public class SubmitPlayReqValidator : AbstractValidator<SubmitPlayReq>
{
    public SubmitPlayReqValidator()
    {
        RuleFor(x => x.Character)
            .NotEmpty();
        
        RuleFor(x => x.ColumnValues)
            .NotNull();
    }
}
