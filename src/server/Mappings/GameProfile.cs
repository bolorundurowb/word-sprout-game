using AutoMapper;
using WordSproutApi.Models;
using WordSproutApi.Responses;

namespace WordSproutApi.Mappings;

public class GameProfile : Profile
{
    public GameProfile()
    {
        CreateMap<Player, PlayerRes>();

        CreateMap<Game, GameRes>()
            .ForMember(
                dst => dst.Id,
                opt => opt.MapFrom(src => src.Id.ToString())
            )
            .ForMember(
                dst => dst.Status,
                opt => opt.MapFrom(src => src.Status.ToString())
            );

        CreateMap<GameState, GameStateRes>()
            .ForMember(
                dst => dst.RoundStatus,
                opt => opt.MapFrom(src => src.RoundStatus.ToString())
            )
            .ForMember(
                dst => dst.SecsSinceStatusChange,
                opt => opt.MapFrom(src =>
                    src.RoundStatusSetAt.HasValue
                        ? (DateTimeOffset.UtcNow - src.RoundStatusSetAt.Value).TotalSeconds
                        : 0)
            );
    }
}