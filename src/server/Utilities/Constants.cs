using shortid.Configuration;

namespace WordSproutApi.Utilities;

public static class Constants
{
    public static GenerationOptions GameCodeGenOptions =>
        new GenerationOptions(useNumbers: true, useSpecialCharacters: false, length: 8);
}
