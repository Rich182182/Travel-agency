using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Enums;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.WebApi.Models.Requests;

namespace TravelAgency.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly ITourService _tourService;
        private readonly IMapper _mapper;

        public ToursController(ITourService tourService, IMapper mapper)
        {
            _tourService = tourService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tours = await _tourService.GetAllAsync();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tour = await _tourService.GetByIdAsync(id);
            return Ok(tour);
        }

        [HttpGet("hot")]
        public async Task<IActionResult> GetHot()
        {
            var tours = await _tourService.GetHotToursAsync();
            return Ok(tours);
        }

        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetByType(TourType type)
        {
            var tours = await _tourService.GetByTypeAsync(type);
            return Ok(tours);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateTourRequest request)
        {
            var dto = _mapper.Map<CreateTourDto>(request);
            var result = await _tourService.CreateAsync(dto);

            return Ok(result);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTourRequest request)
        {
            var dto = _mapper.Map<UpdateTourDto>(request);
            var result = await _tourService.UpdateAsync(id, dto);

            return Ok(result);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _tourService.DeleteAsync(id);
            return Ok(new { message = "Тур видалено" });
        }

        [HttpGet("city/{city}")]
        public async Task<IActionResult> GetByCity(string city)
        {
            var tours = await _tourService.GetByCityAsync(city);
            return Ok(tours);
        }
    }
}