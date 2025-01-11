namespace WordSproutApi.Responses;

public class GameStateRes
{
    public char? CurrentCharacter { get; set; }

    public List<char> PlayedCharacters { get; set; } = null!;

    public string? RoundComptroller { get; set; }

    public string? RoundStatus { get; set; }

    public double SecsSinceStatusChange { get; set; }
}