import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const { showToast } = useNotification();
  const { user } = useAuth();

  const getLatestFavorites = (): string[] => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  };

  const [favorites, setFavorites] = useState<string[]>(getLatestFavorites());

  useEffect(() => {
    const handleSync = () => {
      setFavorites(getLatestFavorites());
    };

    window.addEventListener('favorites-updated', handleSync);
    return () => window.removeEventListener('favorites-updated', handleSync);
  }, []);

  useEffect(() => {
    if (!user && getLatestFavorites().length > 0) {
      localStorage.removeItem('favorites');
      setFavorites([]);
      window.dispatchEvent(new Event('favorites-updated'));
    }
  }, [user]);

  const toggleFavorite = useCallback((tourId: string) => {
    if (!user) {
      showToast('Будь ласка, увійдіть в систему, щоб зберігати тури до улюблених.', 'error');
      return;
    }

    const currentFavs = getLatestFavorites();
    const isRemoving = currentFavs.includes(tourId);
    
    const newFavs = isRemoving 
      ? currentFavs.filter(id => id !== tourId) 
      : [...currentFavs, tourId];
    
    if (!isRemoving) {
      showToast('Тур додано до улюблених! ❤️', 'success');
    }

    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setFavorites(newFavs);
    window.dispatchEvent(new Event('favorites-updated'));
    
  }, [user, showToast]);

  const isFavorite = useCallback((tourId: string) => {
     return user ? favorites.includes(tourId) : false;
  }, [user, favorites]);

  return { favorites, toggleFavorite, isFavorite };
}