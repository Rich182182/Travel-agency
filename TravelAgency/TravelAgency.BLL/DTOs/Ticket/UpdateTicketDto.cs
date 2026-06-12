using TravelAgency.BLL.DTOs.Enums;
public class UpdateTicketDto
{
    public int Id { get; set; }
    public decimal Price { get; set; }
    public TicketType Type { get; set; }
}