 import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { FavoritesAPI } from '../api/client';

export function useFavorites() {
  const { showToast } = useNotification();
  const { user } = useAuth();

  const getLatestFavorites = (): string[] => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  };

  const [favorites, setFavorites] = useState<string[]>(getLatestFavorites());

  useEffect(() => {
    const handleSync = () => setFavorites(getLatestFavorites());
    window.addEventListener('favorites-updated', handleSync);
    return () => window.removeEventListener('favorites-updated', handleSync);
  }, []);

  useEffect(() => {
    const syncWithServer = async () => {
      if (user) {
        try {
          const res = await FavoritesAPI.getAll();
          
          const serverFavs = res.data.map((item: any) => {
            if (typeof item === 'number' || typeof item === 'string') {
              return item.toString();
            }
            const validId = item.tourId || item.TourId || item.id || item.Id || item.tour?.id;
            return validId ? validId.toString() : null;
          }).filter(Boolean); 
          
          localStorage.setItem('favorites', JSON.stringify(serverFavs));
          setFavorites(serverFavs);
          window.dispatchEvent(new Event('favorites-updated'));
        } catch (error) {
          console.error("Не вдалося завантажити улюблені тури з сервера", error);
        }
      } else {
        if (getLatestFavorites().length > 0) {
          localStorage.removeItem('favorites');
          setFavorites([]);
          window.dispatchEvent(new Event('favorites-updated'));
        }
      }
    };

    syncWithServer();
  }, [user]);

  const toggleFavorite = useCallback(async (tourId: string) => {
    if (!user) {
      showToast('Будь ласка, увійдіть в систему, щоб зберігати тури до улюблених.', 'error');
      return;
    }

    const currentFavs = getLatestFavorites();
    const isRemoving = currentFavs.includes(tourId);
    
    const newFavs = isRemoving 
      ? currentFavs.filter(id => id !== tourId) 
      : [...currentFavs, tourId];
    
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setFavorites(newFavs);
    window.dispatchEvent(new Event('favorites-updated'));

    try {
      if (isRemoving) {
        await FavoritesAPI.delete(Number(tourId));
      } else {
        await FavoritesAPI.add({ tourId: Number(tourId) });
        showToast('Тур додано до улюблених!', 'success');
      }
    } catch (error) {
      localStorage.setItem('favorites', JSON.stringify(currentFavs));
      setFavorites(currentFavs);
      window.dispatchEvent(new Event('favorites-updated'));
      showToast('Помилка збереження на сервері. Спробуйте ще раз.', 'error');
    }
  }, [user, showToast]);

  const isFavorite = useCallback((tourId: string) => {
     return user ? favorites.includes(tourId) : false;
  }, [user, favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
