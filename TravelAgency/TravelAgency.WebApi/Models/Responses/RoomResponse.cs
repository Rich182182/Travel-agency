namespace TravelAgency.WebApi.Models.Responses
{
    public class RoomResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }

        public int HotelId { get; set; }
    }
}