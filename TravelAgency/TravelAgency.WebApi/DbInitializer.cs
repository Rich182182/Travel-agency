using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Threading.Tasks;
using TravelAgency.DAL;
using TravelAgency.DAL.Entities;

namespace TravelAgency.WebApi.Extensions
{
    public static class DbInitializer
    {
        public static async Task SeedAdminAsync(this IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<AppDbContext>();
                if (!context.Users.Any(u => u.Email == "admin@gmail.com"))
                {
                    string passwordHash = BCrypt.Net.BCrypt.HashPassword("123");

                    var admin = new User
                    {
                        Email = "admin@gmail.com",
                        Role = "Admin",
                        PasswordHash = passwordHash
                    };

                    await context.Users.AddAsync(admin);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}