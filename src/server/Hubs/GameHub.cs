using Microsoft.AspNetCore.SignalR;
using WordSproutApi.Models;

namespace WordSproutApi.Hubs;

public interface IGameHubClient
{
    Task PlayerJoined(string gameCode, string userName);

    Task GameStarted(string gameCode, GameState gameState);

    Task RoundCountdownInitiated(string gameCode, GameState gameState);

    Task RoundStarted(string gameCode, GameState gameState);

    Task RoundEnded(string gameCode, GameState gameState);

    Task GameOver(string gameCode, List<string> winningPlayers, Dictionary<string, int> playerScores);

    Task RoundPlaySubmitted(string gameCode, string userName, char character, Dictionary<string, string?> columnValues);
}

public class GameHub : Hub<IGameHubClient>
{
    public async Task PlayerJoined(string gameCode, string userName) =>
        await Clients.All.PlayerJoined(gameCode, userName);

    public async Task GameStarted(string gameCode, GameState gameState) => await Clients.All.GameStarted(gameCode, gameState);

    public async Task RoundCountdownInitiated(string gameCode, GameState gameState) =>
        await Clients.All.RoundCountdownInitiated(gameCode, gameState);

    public async Task RoundStarted(string gameCode, GameState gameState) =>
        await Clients.All.RoundStarted(gameCode, gameState);

    public async Task RoundEnded(string gameCode, GameState gameState) =>
        await Clients.All.RoundEnded(gameCode, gameState);

    public async Task GameOver(string gameCode, List<string> winningPlayers, Dictionary<string, int> playerScores) =>
        await Clients.All.GameOver(gameCode, winningPlayers, playerScores);

    public async Task RoundPlaySubmitted(string gameCode, string userName, char character,
        Dictionary<string, string?> columnValues) =>
        await Clients.All.RoundPlaySubmitted(gameCode, userName, character, columnValues);
}