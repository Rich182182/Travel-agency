using TravelAgency.BLL.DTOs.Enums;
namespace TravelAgency.BLL.DTOs
{
    public class CreateTicketDto
    {
        public decimal Price { get; set; }
        public TicketType Type { get; set; }
    }
}