using meerkat;
using meerkat.Attributes;
using word_sprout_api.Enums;

namespace word_sprout_api.Models;

[Collection(Name = "games", TrackTimestamps = true)]
public class Game : Schema
{
    public string Code { get; set; }
    
    public string InitiatedBy { get; set; }

    public TimeSpan MaxIntervalBetweenRounds { get; set; }

    public TimeSpan MaxRoundDuration { get; set; }

    public List<string> Columns { get; set; }

    public GameStatus Status { get; set; }

    public GameState State { get; set; }
}

