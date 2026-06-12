import { useState, useEffect } from 'react';
import { FavoritesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      FavoritesAPI.getAll()
        .then(response => {
          // Бекенд може повертати масив об'єктів Tour або Favorite. Беремо id туру.
          const ids = response.data.map((item: any) => (item.tourId || item.id).toString());
          setFavorites(ids);
        })
        .catch(err => console.error("Помилка завантаження улюблених", err));
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (tourId: string) => {
    if (!user) {
      alert("Увійдіть в систему, щоб додавати тури в улюблені!");
      return;
    }

    const isFav = favorites.includes(tourId);

    // Оптимістичне оновлення інтерфейсу (швидка реакція для юзера)
    setFavorites(prev => 
      isFav ? prev.filter(id => id !== tourId) : [...prev, tourId]
    );

    try {
      if (isFav) {
        await FavoritesAPI.remove(Number(tourId));
      } else {
        await FavoritesAPI.add(Number(tourId));
      }
    } catch (error) {
      // Якщо на бекенді сталася помилка - відкочуємо зміни
      setFavorites(prev => 
        isFav ? [...prev, tourId] : prev.filter(id => id !== tourId)
      );
      console.error("Помилка збереження улюбленого", error);
    }
  };

  const isFavorite = (tourId: string) => favorites.includes(tourId);

  return { favorites, toggleFavorite, isFavorite };
}