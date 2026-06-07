using AutoMapper;
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
        }
    }
}