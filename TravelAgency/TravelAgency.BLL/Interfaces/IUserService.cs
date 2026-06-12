using System.Collections.Generic;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.BLL.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task ChangeUserRoleAsync(int currentAdminId, int targetUserId, Role newRole);
    }
}