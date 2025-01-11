using WordSproutApi.Enums;

namespace WordSproutApi.Models;

public class GameState
{
    public char? CurrentCharacter { get; private set; }

    public List<char> PlayedCharacters { get; private set; }

    public string? RoundComptroller { get; private set; }

    public GameRoundStatus? RoundStatus { get; private set; }

    public DateTimeOffset? RoundStatusSetAt { get; private set; }

    public GameState() => PlayedCharacters = [];

    public void SetRoundComptroller(string userName)
    {
        RoundComptroller = userName;
        SetRoundStatus(GameRoundStatus.AwaitingCharacterSelection);
    }

    public void MarkCharacterAsPlayed()
    {
        if (CurrentCharacter is null)
            return;

        PlayedCharacters.Add(CurrentCharacter.Value);
        CurrentCharacter = null;
    }

    public void SetCurrentCharacter(char character)
    {
        CurrentCharacter = character;
        SetRoundStatus(GameRoundStatus.InProgress);
    }

    public void MarkAsAwaitingScoring() => SetRoundStatus(GameRoundStatus.AwaitingScoring);

    public void ClearStatus()
    {
        RoundStatus = null;
        RoundStatusSetAt = null;
    }

    private void SetRoundStatus(GameRoundStatus roundStatus)
    {
        RoundStatus = roundStatus;
        RoundStatusSetAt = DateTimeOffset.UtcNow;
    }
}