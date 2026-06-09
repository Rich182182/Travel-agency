using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.DAL.Entities;
namespace TravelAgency.BLL.Mapping
{
    public class TourDomainProfile : Profile
    {
        public TourDomainProfile()
        {
            CreateMap<Tour, TourDto>().ReverseMap();

            CreateMap<Tour, CreateTourDto>().ReverseMap();

            CreateMap<Ticket, TicketDto>().ReverseMap();

            CreateMap<Tour, UpdateTourDto>().ReverseMap();
        }
    }
}
