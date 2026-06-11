using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Mapping
{
    public class WebApiBookingProfile : Profile
    {
        public WebApiBookingProfile()
        {
            CreateMap<RegisterRequest, RegisterUserDto>();
            CreateMap<LoginRequest, LoginUserDto>();

            CreateMap<CreateBookingRequest, CreateBookingDto>();
            CreateMap<BookingDto, BookingResponse>();

            CreateMap<UserDto, UserResponse>();
            CreateMap<ChangeRoleRequest, ChangeRoleDto>();

            CreateMap<UpdateBookingRequest, UpdateBookingDto>();

            CreateMap<AddFavoriteRequest, AddFavoriteDto>();
        }
    }
}