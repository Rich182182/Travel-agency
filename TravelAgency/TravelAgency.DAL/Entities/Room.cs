using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.DAL.Entities
{
    public class Room : BaseEntity
    {
        public RoomType RoomType { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }

        public int HotelId { get; set; }
        public Hotel Hotel { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}