using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Mapping
{
    public class WebApiRoomProfile : Profile
    {
        public WebApiRoomProfile()
        {
            CreateMap<RoomDto, RoomResponse>().ReverseMap();
            CreateMap<CreateRoomRequest, CreateRoomDto>().ReverseMap();
            CreateMap<UpdateRoomRequest, UpdateRoomDto>().ReverseMap();
        }
    }
}