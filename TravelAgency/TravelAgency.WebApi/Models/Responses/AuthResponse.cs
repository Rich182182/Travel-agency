using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.WebApi.Models.Responses
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public Role Role { get; set; }
    }
}
