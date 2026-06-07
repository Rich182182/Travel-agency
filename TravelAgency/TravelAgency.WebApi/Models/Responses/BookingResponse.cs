namespace TravelAgency.WebApi.Models.Responses
{
    public class BookingResponse
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public int? RoomId { get; set; }
        public decimal TotalPrice { get; set; }
        public int? TicketId { get; set; }
    }
}