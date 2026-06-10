using TravelAgency.BLL.DTOs.Enums;
namespace TravelAgency.WebApi.Models.Requests
{
    public class CreateTourRequest
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string City { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public TourType Type { get; set; }
        public decimal? Promotion { get; set; }
        public List<CreateTicketRequest> Tickets { get; set; }
    }
}