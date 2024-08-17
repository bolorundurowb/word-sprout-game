using MongoDB.Bson;

namespace word_sprout_api.Models;

public class Player
{
    public string UserName { get; set; }

    public DateTimeOffset JoinedAt { get; set; }

    public List<Play> Plays { get; set; }
}
