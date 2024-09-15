﻿using meerkat;
using meerkat.Attributes;
using shortid;
using WordSproutApi.Enums;
using WordSproutApi.Extensions;
using WordSproutApi.Utilities;

namespace WordSproutApi.Models;

[Collection(Name = "games", TrackTimestamps = true)]
public class Game : Schema
{
    public string Code { get; set; }

    public string InitiatedBy { get; set; }

    public int MaxIntervalBetweenRoundsInSecs { get; set; }

    public int MaxRoundDurationInSecs { get; set; }

    public List<string> Columns { get; set; }

    public List<char> CharacterSet { get; set; }

    public List<Player> Players { get; set; }

    public GameStatus Status { get; set; }

    public GameState State { get; set; }

    private Game() { }

    public Game(string userName, int maxIntervalBetweenRoundsInSecs, int maxRoundDurationInSecs, List<string> columns,
        List<char> characterSet) : base()
    {
        Code = ShortId.Generate(Constants.GameCodeGenOptions);
        Status = GameStatus.AwaitingPlayers;
        State = new GameState();

        InitiatedBy = userName;
        MaxIntervalBetweenRoundsInSecs = maxIntervalBetweenRoundsInSecs;
        MaxRoundDurationInSecs = maxRoundDurationInSecs;
        Columns = columns;
        CharacterSet = characterSet;

        Players = new List<Player> { new(userName) };
    }

    public void AddPlayer(string userName)
    {
        var player = new Player(userName);
        Players.Add(player);
    }

    public void Start()
    {
        Status = GameStatus.Active;
        State.SetCurrentPlayer(InitiatedBy);
    }

    public void StartRound(char character) => State.SetCurrentCharacter(character);

    public string SetStateForNextRound()
    {
        // track the current played character
        State.MarkCharacterAsPlayed();

        // choose next player
        var currentPlayerIndex = Players.IndexOf(x => x.UserName == State.CurrentPlayer);
        var nextPlayerIndex = (currentPlayerIndex + 1) % Players.Count;
        State.SetCurrentPlayer(Players[nextPlayerIndex].UserName);

        return State.CurrentPlayer!;
    }
}
