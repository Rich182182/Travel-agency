using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.DAL.Entities;

namespace TravelAgency.BLL.Mapping
{
    public class HotelDomainProfile : Profile
    {
        public HotelDomainProfile()
        {
            CreateMap<Hotel, HotelDto>().ReverseMap();
            CreateMap<Room, RoomDto>().ReverseMap();

            CreateMap<CreateHotelDto, Hotel>().ReverseMap();
            CreateMap<UpdateHotelDto, Hotel>().ReverseMap();
        }
    }
}