import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToursAPI, HotelsAPI, BookingsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { parseBackendError } from '../api/errorHandler';
import { AlertCircle, Loader, Calendar, Tag, MapPin } from 'lucide-react';
import type { Tour, Ticket, Hotel, Room } from '../types';

export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification(); 
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [availableHotels, setAvailableHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tourRes, hotelsRes] = await Promise.all([
          ToursAPI.getById(Number(id)),
          HotelsAPI.getAll()
        ]);
        setTour(tourRes.data);
        setAvailableHotels(hotelsRes.data.filter((h: Hotel) => h.city === tourRes.data.city));
      } catch (error) {
        showToast(parseBackendError(error), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={48} /></div>;
  if (!tour) return <div className="text-center mt-20 text-xl font-bold text-gray-600">Тур не знайдено</div>;

  const isRegular = tour.type === 'Regular';
  const hasAvailableRooms = availableHotels.some(hotel => hotel.rooms && hotel.rooms.some(room => room.isFree));
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = tour.date.split('T')[0] < todayStr;
  
  const canBook = !isExpired && (!isRegular || hasAvailableRooms);

  const calculateTotal = () => {
    let total = tour.price;
    if (tour.isHot && tour.promotion) total -= tour.promotion;
    if (selectedTicket) total += selectedTicket.price;
    if (selectedRoom) total += selectedRoom.price;
    return total;
  };

  const handleBooking = async () => {
    if (isExpired) {
      showToast('Цей тур вже завершився!', 'error');
      return;
    }
    if (!user) { 
      showToast('Спочатку увійдіть в акаунт!', 'error'); 
      navigate('/login'); 
      return; 
    }
    if (!selectedTicket) {
      showToast('Будь ласка, оберіть квиток!', 'error');
      return;
    }
    if (isRegular && (!selectedHotel || !selectedRoom)) {
      showToast('Для звичайного туру необхідно обрати готель та вільний номер!', 'error');
      return;
    }

    try {
      await BookingsAPI.create({
        tourId: tour.id,
        ticketId: selectedTicket.id,
        roomId: selectedRoom?.id
      });
      showToast('Успішно заброньовано! 🎉', 'success');
      navigate('/bookings');
    } catch (error: any) {
      showToast(parseBackendError(error), 'error');
    }
  };

  const translateTicket = (typeStr?: string) => {
    if (typeStr === 'Airplane') return 'Авіа (Літак)';
    if (typeStr === 'Bus') return 'Автобус';
    if (typeStr === 'Train') return 'Потяг';
    if (typeStr === 'Ship') return 'Корабель / Паром';
    return typeStr || 'Невідомо';
  };

  const translateRoomType = (typeStr?: string) => {
    if (typeStr === 'Standart') return 'Стандарт';
    if (typeStr === 'Lux') return 'Люкс';
    if (typeStr === 'Deluxe') return 'Делюкс';
    return typeStr || 'Невідомо';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      <div className="md:w-2/3 space-y-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors">← Назад</button>
        
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">{tour.name}</h1>
            {tour.isHot && <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">HOT</span>}
          </div>
          
          <div className="flex flex-wrap items-center gap-5 mt-4 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
              <MapPin size={16} className="text-blue-600" /> 
              <span>{tour.city}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700">
              <Tag size={16} /> 
              <span>{isRegular ? 'Звичайний тур' : 'Екскурсійний тур'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Calendar size={16} className="text-blue-600" /> 
              <span>{formatDate(tour.date)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description || "Опис туру відсутній."}</p>
        </div>
      </div>

      <div className="md:w-1/3 bg-white border border-gray-100 p-6 rounded-xl shadow-md h-fit space-y-6">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Бронювання</h2>
        
        {isExpired && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg flex items-start gap-3 border border-amber-100">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">Реєстрацію завершено. Дата проведення цього туру вже минула.</p>
          </div>
        )}

        {!isExpired && !canBook && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">У місті {tour.city} наразі немає вільних номерів.</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Оберіть квиток: <span className="text-red-500">*</span></h3>
          <div className="space-y-2">
            {tour.tickets?.map((ticket, index) => (
              <div 
                key={`ticket-${index}`} 
                onClick={() => !isExpired && canBook && setSelectedTicket(ticket)}
                className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTicket?.type === ticket.type ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'hover:bg-gray-50'
                } ${(!canBook || isExpired) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    name="ticket" 
                    className="mr-3 w-4 h-4 text-blue-600" 
                    checked={selectedTicket?.type === ticket.type} 
                    readOnly 
                    disabled={!canBook || isExpired} 
                  />
                  {translateTicket(ticket.type)}
                </div>
                <span className="font-medium">+{ticket.price} ₴</span>
              </div>
            ))}
          </div>
        </div>

        {isRegular && canBook && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Оберіть готель: <span className="text-red-500">*</span></h3>
            <select className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" 
              onChange={(e) => {
                const hotel = availableHotels.find((h: Hotel) => h.id === Number(e.target.value)) || null;
                setSelectedHotel(hotel);
                setSelectedRoom(null);
              }} 
              value={selectedHotel?.id || ""}
              disabled={isExpired}
            >
              <option value="" disabled>-- Оберіть готель --</option>
              {availableHotels.map((h: Hotel) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>

            {selectedHotel && selectedHotel.rooms && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 mb-2 font-medium">Оберіть номер: <span className="text-red-500">*</span></p>
                {selectedHotel.rooms.map(room => (
                  <label key={room.id} className={`flex justify-between items-center p-2 border rounded-lg text-sm ${room.isFree && !isExpired ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-50'}`}>
                    <div>
                      <input 
                        type="radio" 
                        name="room" 
                        className="mr-2 text-blue-600" 
                        checked={selectedRoom?.id === room.id} 
                        onChange={() => !isExpired && room.isFree && setSelectedRoom(room)} 
                        disabled={!room.isFree || isExpired} 
                      />
                      {translateRoomType(room.roomType)} {!room.isFree && '(Зайнято)'}
                    </div>
                    <span className="font-medium">+{room.price} ₴</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="font-semibold">Разом:</span>
            <span className="font-bold text-2xl text-blue-600">{calculateTotal()} ₴</span>
          </div>
          <button 
            onClick={handleBooking} 
            disabled={!canBook || !selectedTicket || (isRegular && !selectedRoom)} 
            className={`w-full font-bold py-3 rounded-lg transition-colors ${
              (!canBook || !selectedTicket || (isRegular && !selectedRoom)) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isExpired ? 'Застарілий тур' : 'Забронювати'}
          </button>
        </div>
      </div>
    </div>
  );
}