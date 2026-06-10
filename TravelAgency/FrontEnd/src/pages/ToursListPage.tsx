import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getTours } from '../api/storage';
import { useFavorites } from '../hooks/useFavorites';
import type { Tour } from '../types';

export default function ToursListPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  
  const [filterType, setFilterType] = useState<'All' | 'Regular' | 'Excursion'>('All');
  const [filterCity, setFilterCity] = useState('All'); // Новий стейт для міста
  const [onlyHot, setOnlyHot] = useState(false);
  
  const [tours, setTours] = useState<Tour[]>([]);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => { setTours(getTours()); }, []);

  // Отримуємо унікальний список міст із турів для випадаючого списку
  const uniqueCities = Array.from(new Set(tours.map(t => t.city)));

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tour.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' ? true : tour.tourType === filterType;
    const matchesCity = filterCity === 'All' ? true : tour.city === filterCity;
    const matchesHot = onlyHot ? tour.isHot : true;
    
    return matchesSearch && matchesType && matchesCity && matchesHot;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {searchTerm ? `Пошук: "${searchTerm}"` : 'Доступні тури'}
      </h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center">
        {/* Фільтр за містом */}
        <select className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
          <option value="All">Всі міста</option>
          {uniqueCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
          <option value="All">Всі типи</option>
          <option value="Regular">Звичайні тури</option>
          <option value="Excursion">Екскурсійні тури</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          <input type="checkbox" className="w-5 h-5 rounded text-red-600 cursor-pointer" checked={onlyHot} onChange={(e) => setOnlyHot(e.target.checked)} />
          <span className="text-red-700 font-semibold">🔥 Тільки гарячі</span>
        </label>
      </div>

      {filteredTours.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl border text-gray-500">За вашим запитом турів не знайдено.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map(tour => {
            const favorited = isFavorite(tour.id);
            return (
              <div key={tour.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg relative flex flex-col transition-shadow">
                <button onClick={() => toggleFavorite(tour.id)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
                  <Heart size={20} className={favorited ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
                <div className="p-5 flex flex-col h-full pt-12">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{tour.name}</h2>
                    {tour.isHot && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-2">HOT</span>}
                  </div>
                  <p className="text-gray-500 text-sm mb-4">📍 {tour.city}</p>
                  <div className="mt-auto pt-4 border-t">
                    <p className="text-2xl font-bold text-blue-600 mb-4">
                      {tour.isHot && tour.discount ? tour.price - tour.discount : tour.price} ₴
                    </p>
                    <Link to={`/tour/${tour.id}`} className="block text-center w-full bg-blue-50 text-blue-700 font-bold py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                      Детальніше
                    </Link>
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