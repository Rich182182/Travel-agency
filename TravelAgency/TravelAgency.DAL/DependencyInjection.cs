using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TravelAgency.DAL.Interfaces;
using TravelAgency.DAL.Repositories;

namespace TravelAgency.DAL
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDalInfrastructure(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
            return services;
        }
    }
}