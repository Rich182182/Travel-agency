using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;
using AutoMapper;

namespace TravelAgency.BLL.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public FavoriteService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<string>> GetUserFavoritesAsync(int userId)
        {
            var favorites = await _unitOfWork.FavoriteTours.GetAllAsync();

            return favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.TourId.ToString())
                .ToList();
        }

        public async Task AddToFavoritesAsync(int userId, AddFavoriteDto dto)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(dto.TourId);
            if (tour == null)
            {
                throw new NotFoundException("Тур не знайдено.");
            }

            var existingFavorites = await _unitOfWork.FavoriteTours.GetAllAsync();
            bool alreadyExists = existingFavorites.Any(f => f.UserId == userId && f.TourId == dto.TourId);

            if (!alreadyExists)
            {
                var favorite = _mapper.Map<FavoriteTour>(dto);
                favorite.UserId = userId;

                await _unitOfWork.FavoriteTours.AddAsync(favorite);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        public async Task RemoveFromFavoritesAsync(int userId, int tourId)
        {
            var allFavorites = await _unitOfWork.FavoriteTours.GetAllAsync();
            var favorite = allFavorites.FirstOrDefault(f => f.UserId == userId && f.TourId == tourId);

            if (favorite != null)
            {
                _unitOfWork.FavoriteTours.Delete(favorite);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}