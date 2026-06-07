using TravelAgency.BLL.DTOs;

namespace TravelAgency.BLL.Interfaces
{
    public interface IBookingService
    {
        Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto);
        Task DeleteBookingAsync(int userId, int bookingId);
    }
}