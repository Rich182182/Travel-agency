import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const { showToast } = useNotification();
  const { user } = useAuth();

  // Функція для отримання гарантовано найсвіжіших даних з пам'яті браузера
  const getLatestFavorites = (): string[] => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  };

  const [favorites, setFavorites] = useState<string[]>(getLatestFavorites());

  // 1. Слухаємо оновлення. Коли хтось змінює улюблені, всі компоненти миттєво перечитують пам'ять
  useEffect(() => {
    const handleSync = () => {
      setFavorites(getLatestFavorites());
    };

    window.addEventListener('favorites-updated', handleSync);
    return () => window.removeEventListener('favorites-updated', handleSync);
  }, []);

  // 2. Очищення при виході з акаунту
  // Якщо юзера немає, але в пам'яті ще висять тури - жорстко видаляємо їх
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

    // ЗАВЖДИ беремо свіжі дані з localStorage перед зміною, щоб уникнути конфліктів компонентів
    const currentFavs = getLatestFavorites();
    const isRemoving = currentFavs.includes(tourId);
    
    const newFavs = isRemoving 
      ? currentFavs.filter(id => id !== tourId) 
      : [...currentFavs, tourId];
    
    if (!isRemoving) {
      showToast('Тур додано до улюблених! ❤️', 'success');
    }

    // Записуємо в пам'ять і повідомляємо всім компонентам на сторінці (наприклад, Navbar), що треба оновитися
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setFavorites(newFavs);
    window.dispatchEvent(new Event('favorites-updated'));
    
  }, [user, showToast]);

  // Якщо юзер не авторизований, сердечка завжди будуть "порожніми" (false)
  const isFavorite = useCallback((tourId: string) => {
     return user ? favorites.includes(tourId) : false;
  }, [user, favorites]);

  return { favorites, toggleFavorite, isFavorite };
}