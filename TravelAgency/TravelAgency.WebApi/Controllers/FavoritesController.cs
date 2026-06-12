using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.WebApi.Models.Requests;
using TravelAgency.WebApi.Models.Responses;

namespace TravelAgency.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;
        private readonly IMapper _mapper;

        public FavoritesController(IFavoriteService favoriteService, IMapper mapper)
        {
            _favoriteService = favoriteService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            int userId = GetCurrentUserId();
            var favoriteIds = await _favoriteService.GetUserFavoritesAsync(userId);

            return Ok(favoriteIds);
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequest request)
        {
            int validTourId = request.GetValidId();

            if (validTourId == 0)
            {
                return BadRequest("Не вдалося знайти ID туру в запиті");
            }

            int userId = GetCurrentUserId();

            var dto = _mapper.Map<AddFavoriteDto>(request);
            dto.TourId = validTourId;

            await _favoriteService.AddToFavoritesAsync(userId, dto);

            return Ok(new MessageResponse { Message = "Тур додано до улюблених" });
        }

        [HttpDelete("{tourId}")]
        public async Task<IActionResult> RemoveFavorite(int tourId)
        {
            int userId = GetCurrentUserId();
            await _favoriteService.RemoveFromFavoritesAsync(userId, tourId);

            return NoContent();
        }

        private int GetCurrentUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }

            throw new ValidationException("Помилка авторизації користувача.");
        }
    }
}