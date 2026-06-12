using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.BLL.DTOs.Users
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public Role Role { get; set; }
    }
}