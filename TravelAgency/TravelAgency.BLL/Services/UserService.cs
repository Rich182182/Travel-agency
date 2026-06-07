using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Interfaces;

namespace TravelAgency.BLL.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task ChangeUserRoleAsync(int userId, string newRole)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("Користувача не знайдено.");
            }

            if (newRole != "Admin" && newRole != "Manager" && newRole != "Client")
            {
                throw new ValidationException("Недопустима роль.");
            }

            user.Role = newRole;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}