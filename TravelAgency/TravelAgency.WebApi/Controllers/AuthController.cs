using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IMapper _mapper;

        public AuthController(IAuthService authService, IMapper mapper)
        {
            _authService = authService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var dto = _mapper.Map<RegisterUserDto>(request);

            await _authService.RegisterAsync(dto);

            return Ok(new { message = "Реєстрація пройшла успішно!" });

        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var dto = _mapper.Map<LoginUserDto>(request);

            var result = await _authService.LoginAsync(dto);


            var response = new AuthResponse
            {
                Token = result.Token,
                Role = result.Role
            };

            return Ok(response);
        }
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new
            {
                Id = userId,
                Email = userEmail,
                Role = userRole
            });
        }
    }
}
