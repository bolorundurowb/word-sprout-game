namespace WordSproutApi.Models;

public class Player
{
    public string UserName { get; set; }

    public DateTimeOffset JoinedAt { get; set; }

    public List<Play> Plays { get; set; }

    private Player() { }

    public Player(string userName)
    {
        Plays = new List<Play>();
        JoinedAt = DateTimeOffset.UtcNow;

        UserName = userName.ToLowerInvariant();
    }

    public Play AddPlay(char character, Dictionary<string, string> columnValues)
    {
        Plays ??= new List<Play>();

        if (Plays.Any(x => x.Character == character)) 
            throw new InvalidOperationException("Character already played");

        var play = new Play(character, columnValues);
        Plays.Add(play);

        return play;
    }

    public void ScorePlay(char character, int score)
    {
        var play = Plays.FirstOrDefault(x => x.Character == character);
        
        if (play is null)
            throw new InvalidOperationException("Character has not been played");
        
        play.SetScore(score);
    }
}
