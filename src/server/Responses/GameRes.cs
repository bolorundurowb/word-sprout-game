namespace WordSproutApi.Responses;

public class GameRes
{
    public string Id { get; set; }

    public string Code { get; set; }

    public string Status { get; set; }

    public string InitiatedBy { get; set; }

    public int MaxIntervalBetweenRoundsInSecs { get; set; }

    public int MaxRoundDurationInSecs { get; set; }

    public List<string> Columns { get; set; }

    public List<char> CharacterSet { get; set; }

    public List<PlayerRes> Players { get; set; }
}
