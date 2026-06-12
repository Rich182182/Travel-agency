using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.WebApi.Models.Responses
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public Role Role { get; set; }
    }
}