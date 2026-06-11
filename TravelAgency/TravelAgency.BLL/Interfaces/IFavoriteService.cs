using System.Collections.Generic;
using System.Threading.Tasks;
using TravelAgency.BLL.DTOs;

namespace TravelAgency.BLL.Interfaces
{
    public interface IFavoriteService
    {
        Task<IEnumerable<string>> GetUserFavoritesAsync(int userId);
        Task AddToFavoritesAsync(int userId, AddFavoriteDto dto);
        Task RemoveFromFavoritesAsync(int userId, int tourId);
    }
}