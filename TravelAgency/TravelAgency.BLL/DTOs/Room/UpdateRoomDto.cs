using TravelAgency.BLL.DTOs.Enums;
namespace TravelAgency.BLL.DTOs
{
    public class UpdateRoomDto
    {
        public int Id { get; set; }
        public RoomType RoomType { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
    }
}