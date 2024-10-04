using Microsoft.AspNetCore.SignalR;

namespace WordSproutApi.Hubs;

public interface IGameHubClient
{
    Task PlayerJoined(string gameCode, string userName);

    Task GameStarted(string gameCode);

    Task RoundCountdownInitiated(string gameCode, string turnUsername);

    Task RoundStarted(string gameCode, string turnUsername, char character);

    Task RoundEnded(string gameCode, char character);

    Task GameOver(string gameCode, List<string> winningPlayers, Dictionary<string, int> playerScores);

    Task RoundPlaySubmitted(string gameCode, string userName, char character, Dictionary<string, string?> columnValues);
}

public class GameHub : Hub<IGameHubClient>
{
    public async Task PlayerJoined(string gameCode, string userName) =>
        await Clients.All.PlayerJoined(gameCode, userName);

    public async Task GameStarted(string gameCode) => await Clients.All.GameStarted(gameCode);

    public async Task RoundCountdownInitiated(string gameCode, string userName) =>
        await Clients.All.RoundCountdownInitiated(gameCode, userName);

    public async Task RoundStarted(string gameCode, string turnUsername, char character) =>
        await Clients.All.RoundStarted(gameCode, turnUsername, character);

    public async Task RoundEnded(string gameCode, char character) =>
        await Clients.All.RoundEnded(gameCode, character);

    public async Task GameOver(string gameCode, List<string> winningPlayers, Dictionary<string, int> playerScores) =>
        await Clients.All.GameOver(gameCode, winningPlayers, playerScores);

    public async Task RoundPlaySubmitted(string gameCode, string userName, char character,
        Dictionary<string, string?> columnValues) =>
        await Clients.All.RoundPlaySubmitted(gameCode, userName, character, columnValues);
}