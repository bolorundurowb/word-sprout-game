namespace WordSproutApi.Models;

public class Play
{
    public char Character { get; set; }

    public Dictionary<string, string> ColumnValues { get; set; }

    public int Score { get; set; }
}
