namespace WordSproutApi.Requests;

public class SubmitPlayReq
{
    public char Character { get; set; }

    public Dictionary<string, string> ColumnValues { get; set; }
}
