using Microsoft.Extensions.DependencyInjection;
using TravelAgency.BLL.Interfaces;
using TravelAgency.BLL.Services;
using TravelAgency.DAL;
using TravelAgency.BLL.Mapping;
using TravelAgency.DAL;
namespace TravelAgency.BLL;

public static class DependencyInjection
{
    public static IServiceCollection AddBllInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDalInfrastructure(connectionString);

        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<BookingDomainProfile>();
            cfg.AddProfile<TourDomainProfile>();
            cfg.AddProfile<HotelDomainProfile>();
            cfg.AddProfile<RoomDomainProfile>();
        });

        return services;
    }
}