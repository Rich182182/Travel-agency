import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HeartCrack, Loader, Calendar, Tag } from 'lucide-react';
import { ToursAPI } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import type { Tour } from '../types';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);
  
  const favoriteTours = allTours.filter(tour => favorites.includes(tour.id.toString()));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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
        <div className="text-center bg-white p-12 rounded-xl border border-dashed border-gray-300">
          <HeartCrack size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">Список порожній</h2>
          <p className="text-gray-500 mb-6">Ви ще не додали жодного туру до улюблених.</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Переглянути всі тури
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTours.map(tour => {
            const isExpired = tour.date.split('T')[0] < todayStr;
            return (
              <div key={tour.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col relative hover:shadow-lg transition-all ${isExpired ? 'opacity-65' : ''}`}>
                <button 
                  onClick={() => toggleFavorite(tour.id.toString())}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                  title="Видалити з улюблених"
                >
                  <Heart size={20} className="fill-red-500 text-red-500" />
                </button>

                <div className="p-5 flex flex-col h-full pt-12">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{tour.name}</h2>
                    {tour.isHot && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-2">HOT</span>}
                  </div>
                  <p className="text-gray-500 text-sm mb-3">📍 {tour.city}</p>
                  
                  {/* Додано тип та дату туру в обраному */}
                  <div className="space-y-1.5 mb-4 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-blue-500" />
                      <span>Тип: <span className="text-gray-800">{tour.type === 'Regular' ? 'Звичайний' : 'Екскурсійний'}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-500" />
                      <span>Дата: <span className="text-gray-800">{formatDate(tour.date)}</span></span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t">
                    <p className="text-2xl font-bold text-blue-600 mb-4">
                      {tour.isHot && tour.promotion ? tour.price - tour.promotion : tour.price} ₴
                    </p>
                    {isExpired ? (
                      <div className="block text-center w-full bg-gray-100 text-gray-500 font-bold py-2.5 rounded-lg border border-gray-200 cursor-not-allowed">
                        Тур завершено
                      </div>
                    ) : (
                      <Link to={`/tour/${tour.id}`} className="block text-center w-full bg-blue-50 text-blue-700 font-bold py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
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