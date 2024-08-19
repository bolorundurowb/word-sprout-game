using Microsoft.AspNetCore.SignalR;

namespace WordSproutApi.Hubs;

public interface IGameHubClient
{
    Task PlayerJoined(string userName);
}

public class GameHub : Hub<IGameHubClient>
{
    public async Task PlayerJoined(string userName) => await Clients.All.PlayerJoined(userName);
}
