namespace WordSproutApi.Models;

public class GameState
{
    public char? CurrentCharacter { get; private set; }

    public List<char> PlayedCharacters { get; private set; }

    public string? CurrentPlayer { get; private set; }

    public GameState() => PlayedCharacters = [];

    public void SetCurrentPlayer(string userName) => CurrentPlayer = userName;

    public void MarkCharacterAsPlayed()
    {
        if (CurrentCharacter is null)
            return;

        PlayedCharacters.Add(CurrentCharacter.Value);
        CurrentCharacter = null;
    }

    public void SetCurrentCharacter(char character) => CurrentCharacter = character;
}
