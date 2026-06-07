using AutoMapper;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.WebApi.Models.Requests;

namespace TravelAgency.WebApi.Mapping
{
    public class WebApiBookingProfile : Profile
    {
        public WebApiBookingProfile()
        {
            CreateMap<RegisterRequest, RegisterUserDto>();
        }
    }
}