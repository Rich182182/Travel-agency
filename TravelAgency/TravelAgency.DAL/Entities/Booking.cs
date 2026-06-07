namespace TravelAgency.DAL.Entities
{
    public class Booking : BaseEntity
    {
        public decimal TotalPrice { get; set; }

        public int UserId { get; set; }
        public User Client { get; set; }

        public int TourId { get; set; }
        public Tour Tour { get; set; }

        public int? RoomId { get; set; }
        public Room Room { get; set; }

        public int? TicketId { get; set; }
        public Ticket Ticket { get; set; }
    }
}