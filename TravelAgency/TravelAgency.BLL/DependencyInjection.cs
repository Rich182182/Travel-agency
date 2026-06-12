using Microsoft.Extensions.DependencyInjection;
using TravelAgency.BLL.Interfaces;
using TravelAgency.BLL.Services;
using TravelAgency.DAL;
using TravelAgency.BLL.Mapping;

namespace TravelAgency.BLL
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddBusinessLogicLayer(this IServiceCollection services, string connectionString)
        {
            services.AddDataAccessLayer(connectionString);

            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<BookingDomainProfile>();
                cfg.AddProfile<TourDomainProfile>();
                cfg.AddProfile<HotelDomainProfile>();
                cfg.AddProfile<RoomDomainProfile>();
            });
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ITourService, TourService>();
            services.AddScoped<IFavoriteService, FavoriteService>();
            services.AddScoped<IHotelService, HotelService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoomService, RoomService>();

            return services;
        }
    }
}