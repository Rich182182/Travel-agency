using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;

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
                var hotel = await _unitOfWork.Hotels.GetByIdAsync(room.HotelId);
                if (hotel == null || hotel.City != tour.City)
                {
                    throw new ValidationException("Обраний номер знаходиться в готелі, який не відповідає місту проведення туру.");
                }

                finalPrice += room.Price;
                room.IsFree = false;
                _unitOfWork.Rooms.Update(room);
            }

            if (dto.TicketId.HasValue)
            {
                var ticket = await _unitOfWork.Tickets.GetByIdAsync(dto.TicketId.Value);
                if (ticket == null) throw new NotFoundException("Квиток не знайдено.");

                if (ticket.TourId != dto.TourId)
                {
                    throw new ValidationException("Цей квиток не належить до обраного туру.");
                }

                finalPrice += ticket.Price;
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
        public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId)
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var userBookings = allBookings.Where(b => b.UserId == userId);
            return _mapper.Map<IEnumerable<BookingDto>>(userBookings);
        }

        public async Task<BookingDto> UpdateBookingAsync(int userId, int bookingId, UpdateBookingDto dto)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null) throw new NotFoundException("Бронювання не знайдено.");
            if (booking.UserId != userId) throw new ValidationException("Ви не можете змінювати чуже бронювання.");

            var tour = await _unitOfWork.Tours.GetByIdAsync(booking.TourId);
            decimal newTotalPrice = tour.Promotion.HasValue ? tour.Price - tour.Promotion.Value : tour.Price;

            if (booking.RoomId != dto.RoomId)
            {
                if (booking.RoomId.HasValue)
                {
                    var oldRoom = await _unitOfWork.Rooms.GetByIdAsync(booking.RoomId.Value);
                    if (oldRoom != null)
                    {
                        oldRoom.IsFree = true;
                        _unitOfWork.Rooms.Update(oldRoom);
                    }
                }

                if (dto.RoomId.HasValue)
                {
                    var newRoom = await _unitOfWork.Rooms.GetByIdAsync(dto.RoomId.Value);
                    if (newRoom == null) throw new NotFoundException("Новий номер не знайдено.");
                    if (!newRoom.IsFree) throw new ValidationException("Цей номер вже зайнятий.");

                    var newHotel = await _unitOfWork.Hotels.GetByIdAsync(newRoom.HotelId);
                    if (newHotel == null || newHotel.City != tour.City)
                    {
                        throw new ValidationException("Новий номер знаходиться в готелі, який не відповідає місту туру.");
                    }

                    newRoom.IsFree = false;
                    _unitOfWork.Rooms.Update(newRoom);
                    newTotalPrice += newRoom.Price;
                }
            }
            else if (booking.RoomId.HasValue)
            {
                var existingRoom = await _unitOfWork.Rooms.GetByIdAsync(booking.RoomId.Value);
                newTotalPrice += existingRoom.Price;
            }

            if (dto.TicketId.HasValue)
            {
                var ticket = await _unitOfWork.Tickets.GetByIdAsync(dto.TicketId.Value);
                if (ticket == null) throw new NotFoundException("Квиток не знайдено.");

                if (ticket.TourId != booking.TourId)
                {
                    throw new ValidationException("Цей квиток не належить до вашого туру.");
                }

                newTotalPrice += ticket.Price;
            }

            booking.RoomId = dto.RoomId;
            booking.TicketId = dto.TicketId;
            booking.TotalPrice = newTotalPrice;

            _unitOfWork.Bookings.Update(booking);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<BookingDto>(booking);
        }
    }
}