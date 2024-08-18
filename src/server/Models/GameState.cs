namespace WordSproutApi.Models;

public class GameState
{
    public char CurrentCharacter { get; set; }

    public List<char> PlayedCharacters { get; set; }

    public string CurrentPlayer { get; set; }
}
