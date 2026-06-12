using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Interfaces;
using TravelAgency.DAL.Entities.Enums;
using System;

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

        public async Task ChangeUserRoleAsync(int currentAdminId, int targetUserId, Role newRole)
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

            user.Role = newRole;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}