using TravelAgency.BLL.DTOs;

namespace TravelAgency.BLL.Interfaces
{
    public interface IHotelService
    {
        Task<HotelDto> CreateAsync(CreateHotelDto dto);
        Task<HotelDto> UpdateAsync(int id, UpdateHotelDto dto);
        Task DeleteAsync(int id);

        Task<HotelDto> GetByIdAsync(int id);
        Task<IEnumerable<HotelDto>> GetAllAsync();
    }
}