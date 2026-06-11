using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IBookingService _bookingService;
        private readonly IMapper _mapper;

        public UsersController(IUserService userService, IBookingService bookingService, IMapper mapper)
        {
            _userService = userService;
            _bookingService = bookingService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var usersDto = await _userService.GetAllUsersAsync();
            var response = _mapper.Map<IEnumerable<UserResponse>>(usersDto);
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequest request)
        {
            var dto = _mapper.Map<ChangeRoleDto>(request);
            int currentAdminId = GetCurrentUserId();

            await _userService.ChangeUserRoleAsync(currentAdminId, id, dto.NewRole);

            return Ok(new { message = $"Роль успішно змінено на {dto.NewRole}" });
        }

        
        private int GetCurrentUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }
            throw new ValidationException("Неможливо ідентифікувати користувача.");
        }
    }
}