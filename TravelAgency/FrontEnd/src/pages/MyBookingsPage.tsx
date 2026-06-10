import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, saveBookings, getTours, getHotels, updateRoomAvailability } from '../api/storage';
import { Trash2 } from 'lucide-react';
import type { Booking, Tour, Hotel } from '../types';

export default function MyBookingsPage() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    if (user) {
      setBookings(getBookings().filter(b => b.userId === user.id));
      setTours(getTours());
      setHotels(getHotels());
    }
  }, [user]);

  if (!user) return <div className="text-center mt-20 font-bold">Увійдіть в систему</div>;

  const handleUpdateBooking = (bookingId: string, newTicketId: string, newRoomId?: string) => {
    const allBookings = getBookings();
    const oldBooking = allBookings.find(b => b.id === bookingId);

    if (oldBooking) {
      // Якщо кімната змінилася, звільняємо стару і займаємо нову
      if (oldBooking.roomId !== newRoomId) {
        if (oldBooking.roomId && oldBooking.hotelId) {
          updateRoomAvailability(oldBooking.hotelId, oldBooking.roomId, true); // Звільняємо
        }
        if (newRoomId && oldBooking.hotelId) {
          updateRoomAvailability(oldBooking.hotelId, newRoomId, false); // Займаємо нову
        }
      }
    }

    const updated = allBookings.map(b => b.id === bookingId ? { ...b, ticketId: newTicketId, roomId: newRoomId || undefined } : b);
    saveBookings(updated);
    
    setBookings(updated.filter(b => b.userId === user.id));
    setHotels(getHotels()); // Оновлюємо стейт готелів, щоб інтерфейс побачив зміни
    alert('Бронювання оновлено!');
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;

    const allBookings = getBookings();
    const bookingToDelete = allBookings.find(b => b.id === bookingId);

    // Якщо в бронюванні був номер, звільняємо його
    if (bookingToDelete?.hotelId && bookingToDelete?.roomId) {
      updateRoomAvailability(bookingToDelete.hotelId, bookingToDelete.roomId, true);
    }

    const updated = allBookings.filter(b => b.id !== bookingId);
    saveBookings(updated);
    
    setBookings(updated.filter(b => b.userId === user.id));
    setHotels(getHotels());
  };

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
                <button 
                  onClick={() => handleDeleteBooking(booking.id)}
                  className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Скасувати бронювання"
                >
                  <Trash2 size={18} /> Скасувати
                </button>

                <h2 className="text-xl font-bold text-blue-600 mb-6">{tour.name}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ваш квиток:</label>
                    <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" value={booking.ticketId} onChange={(e) => handleUpdateBooking(booking.id, e.target.value, booking.roomId)}>
                      {tour.tickets.map(t => <option key={t.id} value={t.id}>{t.type} (+{t.price} ₴)</option>)}
                    </select>
                  </div>

                  {booking.hotelId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ваш номер (Готелі в {tour.city}):</label>
                      <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" value={booking.roomId || ''} onChange={(e) => handleUpdateBooking(booking.id, booking.ticketId, e.target.value)}>
                        <option value="">Без номера (звільнити поточний)</option>
                        {availableHotels.find(h => h.id === booking.hotelId)?.rooms.map(r => (
                          <option key={r.id} value={r.id} disabled={!r.isFree && r.id !== booking.roomId}>
                            {r.name} (+{r.price} ₴) {!r.isFree && r.id !== booking.roomId ? '(Зайнято)' : ''}
                          </option>
                        ))}
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