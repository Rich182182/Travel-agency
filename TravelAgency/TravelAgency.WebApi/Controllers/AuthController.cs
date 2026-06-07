using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TravelAgency.BLL.DTOs.Users;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.WebApi.Models.Requests;

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
            try
            {
                var dto = _mapper.Map<RegisterUserDto>(request);

                await _authService.RegisterAsync(dto);

                return Ok(new { message = "Реєстрація пройшла успішно!" });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
