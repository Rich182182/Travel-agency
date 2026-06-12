using TravelAgency.DAL.Entities.Enums;
namespace TravelAgency.DAL.Entities
{
    public class Ticket : BaseEntity
    {
        public decimal Price { get; set; }
        public TicketType Type { get; set; }
        public DateTime Date { get; set; }

        public int TourId { get; set; }
        public Tour Tour { get; set; }
    }
}