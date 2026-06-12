namespace TravelAgency.BLL.DTOs
{
    public class CreateBookingDto
    {
        public int TourId { get; set; }
        public int? RoomId { get; set; }
        public int? TicketId { get; set; }
    }
}
