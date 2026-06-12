using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL;
using TravelAgency.DAL.Entities;

namespace TravelAgency.BLL.Services
{
    public class DbInitializationService : IDbInitializationService
    {
        private readonly AppDbContext _context;

        public DbInitializationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task InitializeAsync()
        {
            await _context.Database.MigrateAsync();

            if (!_context.Users.Any(u => u.Email == "admin@gmail.com"))
            {
                var admin = new User
                {
                    Email = "admin@gmail.com",
                    Role = DAL.Entities.Enums.Role.Admin,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123")
                };

                await _context.Users.AddAsync(admin);
                await _context.SaveChangesAsync();
            }
        }
    }
}