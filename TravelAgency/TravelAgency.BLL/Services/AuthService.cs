using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;
using TravelAgency.DAL.Repositories;


namespace TravelAgency.BLL.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AuthService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task RegisterAsync(RegisterUserDto dto)
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            if (users.Any(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                throw new ValidationException("Користувач з таким Email вже існує.");
            }

            var newUser = _mapper.Map<User>(dto);

            newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            await _unitOfWork.Users.AddAsync(newUser);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
