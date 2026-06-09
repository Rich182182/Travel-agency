using TravelAgency.BLL.DTOs.Enums;
namespace TravelAgency.BLL.DTOs
{
    public class UpdateTourDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string City { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public TourType Type { get; set; }
        public bool IsHot { get; set; }
        public decimal? Promotion { get; set; }
        public List<UpdateTicketDto> Tickets { get; set; } = new(); // ← додати
    }
}