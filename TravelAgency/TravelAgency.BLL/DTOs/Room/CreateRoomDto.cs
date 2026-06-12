using TravelAgency.BLL.DTOs.Enums;
namespace TravelAgency.BLL.DTOs
{
    public class CreateRoomDto
    {
        public RoomType RoomType { get; set; }
        public decimal Price { get; set; }
    }
}