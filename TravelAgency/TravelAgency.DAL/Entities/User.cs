using System.Collections.Generic;

namespace TravelAgency.DAL.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; } 

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}