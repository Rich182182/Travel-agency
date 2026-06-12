using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.DAL.Entities;

namespace TravelAgency.BLL.Mapping
{
    public class RoomDomainProfile : Profile
    {
        public RoomDomainProfile()
        {
            CreateMap<Room, RoomDto>().ReverseMap();
            CreateMap<CreateRoomDto, Room>().ReverseMap();
            CreateMap<UpdateRoomDto, Room>().ReverseMap();

            CreateMap<DAL.Entities.Enums.RoomType, BLL.DTOs.Enums.RoomType>()
                .ConvertUsing(x => (BLL.DTOs.Enums.RoomType)x);

            CreateMap<BLL.DTOs.Enums.RoomType, DAL.Entities.Enums.RoomType>()
                .ConvertUsing(x => (DAL.Entities.Enums.RoomType)x);
        }
    }
}