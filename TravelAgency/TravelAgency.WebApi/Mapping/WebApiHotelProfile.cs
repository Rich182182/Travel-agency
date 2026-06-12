using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Mapping
{
    public class WebApiHotelProfile : Profile
    {
        public WebApiHotelProfile()
        {
            CreateMap<HotelDto, HotelResponse>().ReverseMap();
            CreateMap<CreateHotelRequest, CreateHotelDto>().ReverseMap();
            CreateMap<UpdateHotelRequest, UpdateHotelDto>().ReverseMap();
        }
    }
}