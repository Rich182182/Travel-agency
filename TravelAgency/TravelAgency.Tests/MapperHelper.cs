using AutoMapper;
using TravelAgency.BLL.Mapping;

// Псевдоніми для енамів
using BllEnums = TravelAgency.BLL.DTOs.Enums;
using DalEnums = TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.Tests.Helpers;

public static class MapperHelper
{
    public static IMapper CreateMapper()
    {
        var mapperConfiguration = new global::AutoMapper.MapperConfiguration(configuration =>
        {
            // Підключаємо твій профіль
            configuration.AddProfile<TourDomainProfile>();

            // Залишаємо мапінги енамів, щоб AutoMapper не губився
            configuration.CreateMap<DalEnums.TourType, BllEnums.TourType>().ReverseMap();
            configuration.CreateMap<DalEnums.TicketType, BllEnums.TicketType>().ReverseMap();
        });

        return mapperConfiguration.CreateMapper();
    }
}