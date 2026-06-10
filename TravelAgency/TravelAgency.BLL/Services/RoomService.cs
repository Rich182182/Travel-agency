using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;

namespace TravelAgency.BLL.Services
{
    public class RoomService : IRoomService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RoomService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<RoomDto> CreateAsync(int hotelId, CreateRoomDto dto)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(hotelId);

            if (hotel == null)
                throw new NotFoundException("Готель не знайдено.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ValidationException("Назва кімнати не може бути пустою.");

            if (dto.Price <= 0)
                throw new ValidationException("Ціна має бути більше 0.");

            var room = new Room
            {
                Name = dto.Name,
                Price = dto.Price,
                IsFree = true,
                HotelId = hotelId
            };

            await _unitOfWork.Rooms.AddAsync(room);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<RoomDto>(room);
        }

        public async Task<RoomDto> UpdateAsync(int id, UpdateRoomDto dto)
        {
            var room = await _unitOfWork.Rooms.GetByIdAsync(id);

            if (room == null)
                throw new NotFoundException("Кімнату не знайдено.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ValidationException("Назва не може бути пустою.");

            if (dto.Price <= 0)
                throw new ValidationException("Ціна має бути більше 0.");

            room.Name = dto.Name;
            room.Price = dto.Price;
            room.IsFree = dto.IsFree;

            _unitOfWork.Rooms.Update(room);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<RoomDto>(room);
        }

        public async Task DeleteAsync(int id)
        {
            var room = await _unitOfWork.Rooms.GetByIdAsync(id);

            if (room == null)
                throw new NotFoundException("Кімнату не знайдено.");

            _unitOfWork.Rooms.Delete(room);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<RoomDto> GetByIdAsync(int id)
        {
            var room = await _unitOfWork.Rooms.GetByIdAsync(id);

            if (room == null)
                throw new NotFoundException("Кімнату не знайдено.");

            return _mapper.Map<RoomDto>(room);
        }

        public async Task<IEnumerable<RoomDto>> GetByHotelIdAsync(int hotelId)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(hotelId);

            if (hotel == null)
                throw new NotFoundException("Готель не знайдено.");

            var rooms = await _unitOfWork.Rooms.GetAllAsync();

            var filtered = rooms.Where(r => r.HotelId == hotelId);

            return _mapper.Map<IEnumerable<RoomDto>>(filtered);
        }
    }
}