import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTours, getHotels, saveBookings, getBookings, updateRoomAvailability } from '../api/storage';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import type { Tour, Ticket, Hotel, Room, Booking } from '../types';

export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [availableHotels, setAvailableHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    const tours = getTours();
    const found = tours.find(t => t.id === id);
    setTour(found || null);
    if (found) {
      setAvailableHotels(getHotels().filter(h => h.city === found.city));
    }
  }, [id]);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  if (!tour) return <div className="text-center mt-20 text-xl font-bold">Тур не знайдено</div>;

  const isRegular = tour.tourType === 'Regular';
  
  // Перевіряємо, чи є хоча б один вільний номер у всіх готелях цього міста
  const hasAvailableRooms = availableHotels.some(hotel => 
    hotel.rooms.some(room => room.isFree)
  );

  // Бронювання можливе, якщо це екскурсія АБО якщо є вільні номери для звичайного туру
  const canBook = !isRegular || hasAvailableRooms;

  const calculateTotal = () => {
    let total = tour.price;
    if (tour.isHot && tour.discount) total -= tour.discount;
    if (selectedTicket) total += selectedTicket.price;
    if (selectedRoom) total += selectedRoom.price;
    return total;
  };

  const handleBooking = () => {
    if (!user) { alert('Спочатку увійдіть в акаунт!'); navigate('/login'); return; }
    if (!selectedTicket) return alert('Будь ласка, оберіть квиток!');
    
    // Нова валідація: забороняємо бронювати звичайний тур без номера
    if (isRegular && (!selectedHotel || !selectedRoom)) {
      alert('Для звичайного туру необхідно обрати готель та вільний номер!');
      return;
    }
    
    if (selectedHotel && selectedRoom) {
      updateRoomAvailability(selectedHotel.id, selectedRoom.id, false);
    }

    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      userId: user.id,
      tourId: tour.id,
      ticketId: selectedTicket.id,
      hotelId: selectedHotel?.id,
      roomId: selectedRoom?.id,
      totalPrice: calculateTotal(),
    };

    const existing = getBookings();
    saveBookings([...existing, newBooking]);
    alert('Успішно заброньовано!');
    navigate('/bookings');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      <div className="md:w-2/3 space-y-6">
        <button onClick={() => navigate('/')} className="text-gray-500 mb-4 hover:text-blue-600 font-medium">← Назад</button>
        <h1 className="text-3xl font-bold text-gray-800">{tour.name}</h1>
        <p className="text-gray-500 mt-2">📍 {tour.city}</p>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
        </div>
      </div>

      <div className="md:w-1/3 bg-white border border-gray-100 p-6 rounded-xl shadow-md h-fit space-y-6">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Бронювання</h2>
        
        {/* Попередження, якщо всі місця зайняті */}
        {!canBook && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">
              На жаль, у місті {tour.city} наразі немає вільних готельних номерів. Бронювання цього туру тимчасово недоступне.
            </p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Оберіть квиток:</h3>
          <div className="space-y-2">
            {tour.tickets.map((ticket) => (
              <label key={ticket.id} className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <input type="radio" name="ticket" className="mr-3" checked={selectedTicket?.id === ticket.id} onChange={() => setSelectedTicket(ticket)} disabled={!canBook} />
                  {ticket.type}
                </div>
                <span className="font-medium">+{ticket.price} ₴</span>
              </label>
            ))}
          </div>
        </div>

        {isRegular && canBook && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Оберіть готель (місто {tour.city}): <span className="text-red-500">*</span></h3>
            <select 
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" 
              onChange={(e) => {
                const hotel = availableHotels.find(h => h.id === e.target.value) || null;
                setSelectedHotel(hotel);
                setSelectedRoom(null);
              }} 
              value={selectedHotel?.id || ""}
            >
              <option value="" disabled>-- Оберіть готель --</option>
              {availableHotels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            {selectedHotel && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 mb-2 font-medium">Оберіть номер: <span className="text-red-500">*</span></p>
                {selectedHotel.rooms.map(room => (
                  <label key={room.id} className={`flex justify-between items-center p-2 border rounded-lg text-sm ${room.isFree ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-50'}`}>
                    <div>
                      <input type="radio" name="room" className="mr-2" checked={selectedRoom?.id === room.id} onChange={() => setSelectedRoom(room)} disabled={!room.isFree} />
                      {room.name} {!room.isFree && '(Зайнято)'}
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
            disabled={!canBook}
            className={`w-full font-bold py-3 rounded-lg transition-colors ${
              canBook 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canBook ? 'Забронювати' : 'Недоступно'}
          </button>
        </div>
      </div>
    </div>
  );
}