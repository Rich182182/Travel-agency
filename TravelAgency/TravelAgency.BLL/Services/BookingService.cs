using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;
using TravelAgency.DAL.Repositories;

namespace TravelAgency.BLL.Services
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public BookingService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(dto.TourId);
            if (tour == null) throw new NotFoundException("Тур не знайдено.");

            decimal finalPrice = tour.Promotion.HasValue ? tour.Price - tour.Promotion.Value : tour.Price;

            if (dto.RoomId.HasValue)
            {
                var room = await _unitOfWork.Rooms.GetByIdAsync(dto.RoomId.Value);
                if (room == null) throw new NotFoundException("Номер не знайдено.");
                if (!room.IsFree) throw new ValidationException("Цей номер вже зайнятий.");

                finalPrice += room.Price;

                room.IsFree = false;
                _unitOfWork.Rooms.Update(room);
            }
            var booking = _mapper.Map<Booking>(dto);
            booking.UserId = userId;
            booking.TotalPrice = finalPrice;

            await _unitOfWork.Bookings.AddAsync(booking);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<BookingDto>(booking);
        }
        public async Task DeleteBookingAsync(int userId, int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null)
            {
                throw new NotFoundException("Бронювання не знайдено.");
            }

            if (booking.UserId != userId)
            {
                throw new ValidationException("Ви не можете скасувати чуже бронювання.");
            }

            if (booking.RoomId.HasValue)
            {
                var room = await _unitOfWork.Rooms.GetByIdAsync(booking.RoomId.Value);
                if (room != null)
                {
                    room.IsFree = true; 
                    _unitOfWork.Rooms.Update(room);
                }
            }

            _unitOfWork.Bookings.Delete(booking);

            await _unitOfWork.SaveChangesAsync();
        }

    }
}