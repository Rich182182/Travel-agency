using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Enums;
namespace TravelAgency.BLL.Interfaces
{
    public interface ITourService
    {
        Task<TourDto> CreateAsync(CreateTourDto dto);
        Task<TourDto> UpdateAsync(int id, UpdateTourDto dto);
        Task DeleteAsync(int id);

        Task<IEnumerable<TourDto>> GetAllAsync();
        Task<TourDto> GetByIdAsync(int id);

        Task<IEnumerable<TourDto>> GetHotToursAsync();
        Task<IEnumerable<TourDto>> GetByTypeAsync(TourType type);
    }
}
