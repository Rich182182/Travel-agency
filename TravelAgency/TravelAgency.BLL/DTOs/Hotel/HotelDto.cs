using System.Collections.Generic;

namespace TravelAgency.BLL.DTOs
{
    public class HotelDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string City { get; set; }

        public List<RoomDto> Rooms { get; set; }
    }
}