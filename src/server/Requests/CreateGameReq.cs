namespace WordSproutApi.Requests;

public class CreateGameReq
{
    public string UserName { get; set; }

    public int MaxRoundDurationInSecs { get; set; }

    public int MaxIntervalBetweenRoundsInSecs { get; set; }

    public List<string> Columns { get; set; }

    public List<char> CharacterSet { get; set; }
}
