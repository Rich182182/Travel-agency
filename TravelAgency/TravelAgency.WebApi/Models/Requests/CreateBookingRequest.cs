namespace TravelAgency.WebApi.Models.Requests
{
    public class CreateBookingRequest
    {
        public int TourId { get; set; }
        public int? RoomId { get; set; }
    }
}