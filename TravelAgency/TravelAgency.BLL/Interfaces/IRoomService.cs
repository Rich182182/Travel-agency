using TravelAgency.BLL.DTOs;

namespace TravelAgency.BLL.Interfaces
{
    public interface IRoomService
    {
        Task<RoomDto> CreateAsync(int hotelId, CreateRoomDto dto);
        Task<RoomDto> UpdateAsync(int id, UpdateRoomDto dto);
        Task DeleteAsync(int id);

        Task<RoomDto> GetByIdAsync(int id);
        Task<IEnumerable<RoomDto>> GetByHotelIdAsync(int hotelId);
    }
}