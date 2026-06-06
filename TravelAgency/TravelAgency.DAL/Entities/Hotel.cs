using System.Collections.Generic;

namespace TravelAgency.DAL.Entities
{
    public class Hotel : BaseEntity
    {
        public string Name { get; set; }
        public string City { get; set; }

        public ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}