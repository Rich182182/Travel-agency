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
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IMapper _mapper;

        public BookingsController(IBookingService bookingService, IMapper mapper)
        {
            _bookingService = bookingService;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            try
            {
                var dto = _mapper.Map<CreateBookingDto>(request);

                int userId = GetCurrentUserId();

                var resultDto = await _bookingService.CreateBookingAsync(userId, dto);

                var response = _mapper.Map<BookingResponse>(resultDto);

                return Ok(response);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                int userId = GetCurrentUserId(); 

                await _bookingService.DeleteBookingAsync(userId, id);

                return Ok(new { message = "Бронювання успішно скасовано, номер звільнено." });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize] 
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            int userId = GetCurrentUserId();

            var bookingsDto = await _bookingService.GetUserBookingsAsync(userId);
            var response = _mapper.Map<IEnumerable<BookingResponse>>(bookingsDto);

            return Ok(response);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(int id, [FromBody] UpdateBookingRequest request)
        {
            try
            {
                int userId = GetCurrentUserId();
                var dto = _mapper.Map<UpdateBookingDto>(request);

                var resultDto = await _bookingService.UpdateBookingAsync(userId, id, dto);
                var response = _mapper.Map<BookingResponse>(resultDto);

                return Ok(response);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
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