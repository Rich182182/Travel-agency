using System.Threading.Tasks;
using TravelAgency.BLL.DTOs.Users;

namespace TravelAgency.BLL.Interfaces
{
    public interface IAuthService
    {
        Task RegisterAsync(RegisterUserDto dto);
    }
}