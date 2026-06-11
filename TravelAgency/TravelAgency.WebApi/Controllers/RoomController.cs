using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;

namespace TravelAgency.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _roomService.GetByIdAsync(id);
            return Ok(result);

        }

        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetByHotel(int hotelId)
        {
            var result = await _roomService.GetByHotelIdAsync(hotelId);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("{hotelId}")]
        public async Task<IActionResult> Create(int hotelId, CreateRoomDto dto)
        {
            var result = await _roomService.CreateAsync(hotelId, dto);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateRoomDto dto)
        {
            var result = await _roomService.UpdateAsync(id, dto);
            return Ok(result);

        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _roomService.DeleteAsync(id);
            return Ok(new { message = "Номер видалено" });
         
        }
    }
}