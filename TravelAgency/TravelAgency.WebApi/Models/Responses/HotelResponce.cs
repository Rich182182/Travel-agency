using System.Collections.Generic;

namespace TravelAgency.WebApi.Models.Responses
{
    public class HotelResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string City { get; set; }

        public List<RoomResponse> Rooms { get; set; } = new();
    }
}