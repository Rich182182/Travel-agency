using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Mapping
{
    public class WebApiTourProfile : Profile
    {
        public WebApiTourProfile()
        {
            CreateMap<CreateTicketRequest, CreateTicketDto>();
            CreateMap<UpdateTicketRequest, UpdateTicketDto>();

            CreateMap<CreateTourRequest, CreateTourDto>()
                .ForMember(d => d.Tickets, o => o.MapFrom(s => s.Tickets));

            CreateMap<UpdateTourRequest, UpdateTourDto>()
                .ForMember(d => d.Tickets, o => o.MapFrom(s => s.Tickets));

            CreateMap<TourDto, TourResponse>();
        }
    }
}