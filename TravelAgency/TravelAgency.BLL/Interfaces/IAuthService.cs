using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;

namespace TravelAgency.BLL.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginUserDto dto);
        Task RegisterAsync(RegisterUserDto dto);
    }
}