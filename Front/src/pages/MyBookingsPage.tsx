import { useState, useEffect } from 'react';
import { BookingsAPI, ToursAPI, HotelsAPI } from '../api/client';
import { Trash2, Edit, Save, Loader, Wallet } from 'lucide-react';
import type { Booking, Tour, Hotel } from '../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стейт для редагування (ID бронювання, яке зараз редагується)
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [editTicketId, setEditTicketId] = useState<number | undefined>();
  const [editRoomId, setEditRoomId] = useState<number | undefined>();

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

  const handleEditClick = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setEditTicketId(booking.ticketId);
    setEditRoomId(booking.roomId);
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
  };

  const handleSaveBooking = async (bookingId: number) => {
    try {
      await BookingsAPI.update(bookingId, { ticketId: editTicketId, roomId: editRoomId });
      alert('Бронювання успішно оновлено!');
      setEditingBookingId(null);
      fetchAllData(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Помилка при оновленні бронювання');
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;
    try {
      await BookingsAPI.delete(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      fetchAllData();
    } catch (error) {
      alert('Помилка при скасуванні');
    }
  };

  const translateTicket = (typeStr?: string) => {
    if (typeStr === 'Airplane') return 'Авіа (Літак)';
    if (typeStr === 'Bus') return 'Автобус';
    return typeStr || 'Невідомо';
  };

  if (isLoading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Мої бронювання</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl border text-gray-500 shadow-sm">
          У вас ще немає активних бронювань.
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking, index) => {
            const tour = tours.find(t => t.id === booking.tourId);
            if (!tour) return null;
            
            const availableHotels = hotels.filter(h => h.city === tour.city);
            const ticket = tour.tickets?.find(t => t.id === booking.ticketId);
            
            // Шукаємо номер серед усіх готелів цього міста
            let room = null;
            let hotelName = '';
            for (const h of availableHotels) {
              const r = h.rooms?.find(rm => rm.id === booking.roomId);
              if (r) {
                room = r;
                hotelName = h.name;
                break;
              }
            }

            // Розрахунок загальної вартості
            const baseTourPrice = tour.isHot && tour.promotion ? tour.price - tour.promotion : tour.price;
            const ticketPrice = ticket ? ticket.price : 0;
            const roomPrice = room ? room.price : 0;
            const totalCost = baseTourPrice + ticketPrice + roomPrice;

            const isEditing = editingBookingId === booking.id;

            return (
              <div key={booking.id || index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative transition-all hover:shadow-md">
                
                {/* Кнопки керування в правому верхньому куті */}
                {!isEditing && (
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button onClick={() => handleEditClick(booking)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                      <Edit size={18} /> Змінити
                    </button>
                    <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                      <Trash2 size={18} /> Скасувати
                    </button>
                  </div>
                )}

                <h2 className="text-xl font-bold text-blue-600 mb-2 pr-48">{tour.name}</h2>
                <p className="text-gray-500 text-sm mb-6">📍 {tour.city} • {new Date(tour.date).toLocaleDateString('uk-UA')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                  {/* БЛОК КВИТКА */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ваш квиток:</label>
                    {isEditing ? (
                      <select className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" value={editTicketId || ''} onChange={(e) => setEditTicketId(Number(e.target.value))}>
                        <option value="" disabled>Оберіть квиток</option>
                        {tour.tickets?.map((t, tIndex) => (
                          <option key={t.id || `ticket-${tIndex}`} value={t.id}>{translateTicket(t.type)} (+{t.price} ₴)</option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-semibold text-gray-800">{ticket ? `${translateTicket(ticket.type)} (+${ticket.price} ₴)` : 'Не обрано'}</div>
                    )}
                  </div>

                  {/* БЛОК НОМЕРА */}
                  {tour.type === 'Regular' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ваш номер:</label>
                      {isEditing ? (
                        <select className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" value={editRoomId || ''} onChange={(e) => setEditRoomId(Number(e.target.value))}>
                          <option value="" disabled>Оберіть номер</option>
                          {availableHotels.map(h => 
                            h.rooms?.map(r => (
                              <option key={r.id} value={r.id} disabled={!r.isFree && r.id !== booking.roomId}>
                                {h.name} - {r.name} (+{r.price} ₴) {!r.isFree && r.id !== booking.roomId ? '(Зайнято)' : ''}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <div className="font-semibold text-gray-800">{room ? `${hotelName} - ${room.name} (+${room.price} ₴)` : 'Не обрано'}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Wallet className="text-green-600" size={24} />
                    <span className="text-sm font-medium uppercase tracking-wide">Загальна вартість:</span>
                    <span className="text-2xl font-bold text-gray-900 ml-2">{totalCost} ₴</span>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3">
                      <button onClick={handleCancelEdit} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                        Скасувати
                      </button>
                      <button onClick={() => handleSaveBooking(booking.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 transition-colors">
                        <Save size={18} /> Зберегти
                      </button>
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