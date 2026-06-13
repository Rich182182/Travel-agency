import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Loader, Calendar, Tag, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToursAPI } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import type { Tour } from '../types';

export default function ToursListPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  
  const [filterType, setFilterType] = useState<'All' | 'Regular' | 'Excursion'>('All');
  const [filterCity, setFilterCity] = useState('All');
  const [onlyHot, setOnlyHot] = useState(false);
  
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 6;

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await ToursAPI.getAll();
        setTours(response.data);
      } catch (error) {
        console.error("Помилка завантаження турів", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterCity, onlyHot]);

  const uniqueCities = Array.from(new Set(tours.map(t => t.city)));

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tour.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' ? true : tour.type === filterType;
    const matchesCity = filterCity === 'All' ? true : tour.city === filterCity;
    const matchesHot = onlyHot ? tour.isHot : true;
    return matchesSearch && matchesType && matchesCity && matchesHot;
  });

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
  
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{searchTerm ? `Пошук: "${searchTerm}"` : 'Доступні тури'}</h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center">
        <select className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
          <option value="All">Всі міста</option>
          {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>

        <select className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
          <option value="All">Всі типи</option>
          <option value="Regular">Звичайні тури</option>
          <option value="Excursion">Екскурсійні тури</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-4 py-2 rounded-lg border border-red-100 transition-colors hover:bg-red-100">
          <input type="checkbox" className="w-5 h-5 rounded text-red-600 cursor-pointer shrink-0" checked={onlyHot} onChange={(e) => setOnlyHot(e.target.checked)} />
          <span className="text-red-700 font-semibold tracking-wide whitespace-nowrap">🔥 Тільки гарячі</span>
        </label>
      </div>

      {filteredTours.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl border text-gray-500 shadow-sm">За вашим запитом турів не знайдено.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTours.map(tour => {
              const favorited = isFavorite(tour.id.toString());
              const isExpired = tour.date.split('T')[0] < todayStr;

              return (
                <div key={tour.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg relative flex flex-col transition-all ${isExpired ? 'opacity-65 grayscale-30' : ''}`}>
                  
                  <button onClick={() => toggleFavorite(tour.id.toString())} className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
                    <Heart size={20} className={favorited ? "fill-red-500 text-red-500" : "text-gray-400"} />
                  </button>
                  
                  <div className="p-5 flex flex-col h-full pt-6">
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3 pr-12">
                      <h2 className="text-xl font-bold text-gray-800 leading-tight">{tour.name}</h2>
                      {tour.isHot && <span className="bg-linear-to-r from-red-500 to-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold tracking-wider uppercase shadow-sm">HOT</span>}
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 mb-4">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-gray-600 bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Попередня</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors shadow-sm ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-600 border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-gray-600 bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <span className="hidden sm:inline">Наступна</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}