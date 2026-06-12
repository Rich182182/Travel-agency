namespace TravelAgency.BLL.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public int? RoomId { get; set; }
        public int UserId { get; set; }
        public decimal TotalPrice { get; set; }
        public int? TicketId { get; set; }
    }
}
