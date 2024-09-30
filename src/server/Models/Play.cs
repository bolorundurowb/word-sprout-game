namespace WordSproutApi.Models;

public class Play
{
    public char Character { get; set; }

    public Dictionary<string, string?> ColumnValues { get; set; }

    public int Score { get; set; }

    private Play() { }

    public Play(char character, Dictionary<string, string?> columnValues)
    {
        Character = character;
        ColumnValues = columnValues;
    }

    public void SetScore(int score) => Score = score;
}
