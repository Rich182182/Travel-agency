using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.DAL.Entities;

namespace TravelAgency.BLL.Mapping
{
    public class BookingDomainProfile : Profile
    {
        public BookingDomainProfile()
        {
            CreateMap<RegisterUserDto, User>()
                            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "Client")) 
                            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

            CreateMap<Booking, BookingDto>();
            CreateMap<CreateBookingDto, Booking>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore());

            CreateMap<User, UserDto>();

            CreateMap<AddFavoriteDto, FavoriteTour>();
        }
    }
}