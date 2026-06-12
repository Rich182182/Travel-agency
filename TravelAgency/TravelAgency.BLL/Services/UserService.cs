using AutoMapper;
using TravelAgency.BLL.DTOs;
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

        public async Task ChangeUserRoleAsync(int currentAdminId, int targetUserId, string newRole)
        {
            if (currentAdminId == targetUserId)
            {
                throw new ValidationException("Ви не можете змінити роль самому собі.");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(targetUserId);
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