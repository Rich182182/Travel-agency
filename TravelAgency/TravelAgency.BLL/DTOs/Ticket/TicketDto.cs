using TravelAgency.BLL.DTOs.Enums;
public class TicketDto
{
    public decimal Price { get; set; }
    public TicketType Type { get; set; }
    public DateTime Date { get; set; }
}