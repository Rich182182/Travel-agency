namespace TravelAgency.WebApi.Models.Requests
{
    public class UpdateBookingRequest
    {
        public int? RoomId { get; set; }
        public int? TicketId { get; set; }
    }
}