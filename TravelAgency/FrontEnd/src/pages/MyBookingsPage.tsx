import { useState, useEffect } from 'react';
import { BookingsAPI, ToursAPI, HotelsAPI } from '../api/client';
import { Trash2, Loader } from 'lucide-react';
import type { Booking, Tour, Hotel } from '../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [bookRes, tourRes, hotelRes] = await Promise.all([
        BookingsAPI.getMyBookings(),
        ToursAPI.getAll(),
        HotelsAPI.getAll()
      ]);
      setBookings(bookRes.data);
      setTours(tourRes.data);
      setHotels(hotelRes.data);
    } catch (error) {
      console.error("Помилка завантаження бронювань", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateBooking = async (bookingId: number, newTicketId?: number, newRoomId?: number) => {
    try {
      await BookingsAPI.update(bookingId, { ticketId: newTicketId, roomId: newRoomId });
      alert('Бронювання оновлено!');
      fetchAllData(); // Оновлюємо дані з сервера, щоб отримати актуальні статуси кімнат
    } catch (error) {
      alert('Помилка при оновленні');
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;
    try {
      await BookingsAPI.delete(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      fetchAllData(); // Щоб кімната знову стала вільною в інтерфейсі
    } catch (error) {
      alert('Помилка при скасуванні');
    }
  };

  if (isLoading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Мої бронювання</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl border text-gray-500">У вас ще немає активних бронювань.</div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => {
            const tour = tours.find(t => t.id === booking.tourId);
            if (!tour) return null;
            const availableHotels = hotels.filter(h => h.city === tour.city);
            
            return (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                <button onClick={() => handleDeleteBooking(booking.id)} className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                  <Trash2 size={18} /> Скасувати
                </button>

                <h2 className="text-xl font-bold text-blue-600 mb-6">{tour.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ваш квиток:</label>
                    <select className="w-full p-2.5 border rounded-lg bg-gray-50" value={booking.ticketId || ''} onChange={(e) => handleUpdateBooking(booking.id, Number(e.target.value), booking.roomId)}>
                      {tour.tickets.map(t => <option key={t.id} value={t.id}>{t.type} (+{t.price} ₴)</option>)}
                    </select>
                  </div>

                  {/* Якщо є готель в бронюванні, або тур не екскурсійний */}
                  {tour.type === 'Regular' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ваш номер (Готелі в {tour.city}):</label>
                      <select className="w-full p-2.5 border rounded-lg bg-gray-50" value={booking.roomId || ''} onChange={(e) => handleUpdateBooking(booking.id, booking.ticketId, Number(e.target.value))}>
                        <option value="" disabled>-- Оберіть номер --</option>
                        {availableHotels.map(hotel => 
                          hotel.rooms?.map(r => (
                            <option key={r.id} value={r.id} disabled={!r.isFree && r.id !== booking.roomId}>
                              {hotel.name} - {r.name} (+{r.price} ₴) {!r.isFree && r.id !== booking.roomId ? '(Зайнято)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}