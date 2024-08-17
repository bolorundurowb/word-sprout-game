namespace WordSproutApi.Models;

public class Player
{
    public string UserName { get; set; }

    public DateTimeOffset JoinedAt { get; set; }

    public List<Play> Plays { get; set; }
}
