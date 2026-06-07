using TravelAgency.BLL.DTOs;

namespace TravelAgency.BLL.Interfaces
{
    public interface IBookingService
    {
        Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto);
        Task DeleteBookingAsync(int userId, int bookingId);
        Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId);
        Task<BookingDto> UpdateBookingAsync(int userId, int bookingId, UpdateBookingDto dto);
    }
}