namespace WordSproutApi.Requests;

public class ScoreRoundReq
{
    public string Username { get; set; }

    public char Character { get; set; }

    public Dictionary<string, int> PlayerScores { get; set; }
}
