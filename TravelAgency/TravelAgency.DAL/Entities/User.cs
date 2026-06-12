using System.Collections.Generic;
using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.DAL.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public Role Role { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}