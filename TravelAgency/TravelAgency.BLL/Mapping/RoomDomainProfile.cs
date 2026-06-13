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
        }
    }
}