using System.Collections.Generic;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;

namespace TravelAgency.BLL.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task ChangeUserRoleAsync(int userId, string newRole);
    }
}