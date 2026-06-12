import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HeartCrack, Loader, Calendar, Tag, MapPin, Lock } from 'lucide-react';
import { ToursAPI } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import type { Tour } from '../types';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { user } = useAuth(); // Підтягуємо інфо про юзера
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Якщо юзера немає, навіть не робимо запит на сервер
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchTours = async () => {
      try {
        const response = await ToursAPI.getAll();
        setAllTours(response.data);
      } catch (error) {
        console.error("Помилка завантаження турів", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, [user]);
  
  const favoriteTours = allTours.filter(tour => favorites.includes(tour.id.toString()));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // ФІКС: Захист сторінки від неавторизованих користувачів
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 mt-10">
        <div className="text-center bg-white p-12 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Доступ обмежено</h2>
          <p className="text-gray-500 mb-8 text-lg">Будь ласка, увійдіть у свій акаунт, щоб переглядати та зберігати улюблені тури.</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="px-6 py-2.5 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">На головну</Link>
            <Link to="/login" className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Увійти</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={48} /></div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={32} className="text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold text-gray-800">Ваші улюблені тури</h1>
      </div>

      {favoriteTours.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-xl border border-dashed border-gray-300 shadow-sm">
          <HeartCrack size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">Список порожній</h2>
          <p className="text-gray-500 mb-6">Ви ще не додали жодного туру до улюблених.</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Переглянути всі тури
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTours.map(tour => {
            const isExpired = tour.date.split('T')[0] < todayStr;
            
            return (
              <div key={tour.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col relative hover:shadow-lg transition-all ${isExpired ? 'opacity-65 grayscale-[30%]' : ''}`}>
                <button 
                  onClick={() => toggleFavorite(tour.id.toString())}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
                  title="Видалити з улюблених"
                >
                  <Heart size={20} className="fill-red-500 text-red-500" />
                </button>

                <div className="p-5 flex flex-col h-full pt-6">
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3 pr-12">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">{tour.name}</h2>
                    {tour.isHot && <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">HOT</span>}
                  </div>
                  
                  <div className="space-y-2 mb-6 text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{tour.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" />
                      <span>{tour.type === 'Regular' ? 'Звичайний тур' : 'Екскурсійний тур'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span>{formatDate(tour.date)}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t">
                    {tour.isHot && tour.promotion ? (
                      <div className="mb-4">
                         <span className="text-sm text-gray-400 line-through font-medium block">{tour.price} ₴</span>
                         <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-2xl font-bold text-red-600">{tour.price - tour.promotion} ₴</span>
                           <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">
                             Знижка {Math.round((tour.promotion / tour.price) * 100)}%
                           </span>
                         </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-blue-600">{tour.price} ₴</p>
                      </div>
                    )}

                    {isExpired ? (
                      <div className="block text-center w-full bg-gray-100 text-gray-500 font-bold py-2.5 rounded-lg border border-gray-200 cursor-not-allowed">
                        Тур завершено
                      </div>
                    ) : (
                      <Link to={`/tour/${tour.id}`} className="block text-center w-full bg-blue-50 text-blue-700 font-bold py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                        Детальніше
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}