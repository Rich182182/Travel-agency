using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;

namespace TravelAgency.BLL.Services
{
    public class HotelService : IHotelService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public HotelService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<HotelDto> CreateAsync(CreateHotelDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ValidationException("Назва готелю не може бути пустою.");

            if (string.IsNullOrWhiteSpace(dto.City))
                throw new ValidationException("Місто не може бути пустим.");

            var hotel = new Hotel
            {
                Name = dto.Name,
                City = dto.City
            };

            await _unitOfWork.Hotels.AddAsync(hotel);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<HotelDto>(hotel);
        }

        public async Task<HotelDto> UpdateAsync(int id, UpdateHotelDto dto)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(id);

            if (hotel == null)
                throw new NotFoundException("Готель не знайдено.");

            hotel.Name = dto.Name;
            hotel.City = dto.City;

            _unitOfWork.Hotels.Update(hotel);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<HotelDto>(hotel);
        }

        public async Task DeleteAsync(int id)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(id);

            if (hotel == null)
                throw new NotFoundException("Готель не знайдено.");

            _unitOfWork.Hotels.Delete(hotel);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<HotelDto> GetByIdAsync(int id)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(id);

            if (hotel == null)
                throw new NotFoundException("Готель не знайдено.");

            var rooms = await _unitOfWork.Rooms.GetAllAsync();

            hotel.Rooms = rooms.Where(r => r.HotelId == id).ToList();

            return _mapper.Map<HotelDto>(hotel);
        }

        public async Task<IEnumerable<HotelDto>> GetAllAsync()
        {
            var hotels = await _unitOfWork.Hotels.GetAllAsync();
            var rooms = await _unitOfWork.Rooms.GetAllAsync();

            foreach (var hotel in hotels)
            {
                hotel.Rooms = rooms.Where(r => r.HotelId == hotel.Id).ToList();
            }

            return _mapper.Map<IEnumerable<HotelDto>>(hotels);
        }
    }
}