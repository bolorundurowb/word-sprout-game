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
    }
}
