import { useState, useEffect } from 'react';
import { BookingsAPI, ToursAPI, HotelsAPI } from '../api/client';
import { Trash2, Edit, Save, Loader, Wallet, Lock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext'; 
import { parseBackendError } from '../api/errorHandler';
import { Link } from 'react-router-dom';
import type { Booking, Tour, Hotel } from '../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [editTicketId, setEditTicketId] = useState<number | undefined>();
  const [editRoomId, setEditRoomId] = useState<number | undefined>();

  const { showToast, openConfirm } = useNotification();
  const { user } = useAuth(); 

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
      showToast(parseBackendError(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    fetchAllData();
  }, [user]);

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
      showToast('Бронювання успішно оновлено!', 'success');
      setEditingBookingId(null);
      fetchAllData(); 
    } catch (error: any) {
      showToast(parseBackendError(error), 'error');
    }
  };

  const handleDeleteBooking = (bookingId: number) => {
    openConfirm(
      "Скасувати бронювання?",
      "Ви впевнені, що хочете скасувати це бронювання? Цю дію неможливо відмінити.",
      async () => {
        try {
          await BookingsAPI.delete(bookingId);
          setBookings(bookings.filter(b => b.id !== bookingId));
          showToast('Бронювання скасовано', 'success');
          fetchAllData();
        } catch (error) {
          showToast(parseBackendError(error), 'error');
        }
      }
    );
  };

  const translateTicket = (typeStr?: string) => {
    if (typeStr === 'Airplane') return 'Авіа (Літак)';
    if (typeStr === 'Bus') return 'Автобус';
    return typeStr || 'Невідомо';
  };

  // ФІКС ПЕРЕКЛАДУ ТИПУ НОМЕРА
  const translateRoomType = (typeStr?: string) => {
    if (typeStr === 'Standart') return 'Стандарт';
    if (typeStr === 'Lux') return 'Люкс';
    if (typeStr === 'Deluxe') return 'Делюкс';
    return typeStr || 'Невідомо';
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 mt-10">
        <div className="text-center bg-white p-12 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Доступ обмежено</h2>
          <p className="text-gray-500 mb-8 text-lg">Будь ласка, увійдіть у свій акаунт, щоб переглядати ваші бронювання.</p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="px-6 py-2.5 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">На головну</Link>
            <Link to="/login" className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Увійти</Link>
          </div>
        </div>
      </div>
    );
  }

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

            const baseTourPrice = tour.isHot && tour.promotion ? tour.price - tour.promotion : tour.price;
            const ticketPrice = ticket ? ticket.price : 0;
            const roomPrice = room ? room.price : 0;
            const totalCost = baseTourPrice + ticketPrice + roomPrice;

            const isEditing = editingBookingId === booking.id;

            return (
              <div key={booking.id || index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative transition-all hover:shadow-md">
                
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
                
                <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm mb-6 pr-48">
                  <span>📍 {tour.city}</span>
                  <span className="text-gray-300">•</span>
                  <span>📅 {new Date(tour.date).toLocaleDateString('uk-UA')}</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    🏷️ Вартість: {baseTourPrice} ₴
                    {tour.isHot && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">🔥 Hot</span>}
                  </span>
                </div>

                <div className={`grid grid-cols-1 ${tour.type === 'Regular' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ваш квиток:</label>
                    {isEditing ? (
                      <select className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" value={editTicketId || ''} onChange={(e) => setEditTicketId(Number(e.target.value))}>
                        <option value="" disabled>-- Оберіть квиток --</option>
                        {tour.tickets?.map((t, tIndex) => (
                          <option key={t.id || `ticket-${tIndex}`} value={t.id}>{translateTicket(t.type)} (+{t.price} ₴)</option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-semibold text-gray-800">{ticket ? `${translateTicket(ticket.type)} (+${ticket.price} ₴)` : 'Не обрано'}</div>
                    )}
                  </div>

                  {tour.type === 'Regular' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ваш номер:</label>
                      {isEditing ? (
                        <select className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500" value={editRoomId || ''} onChange={(e) => setEditRoomId(Number(e.target.value))}>
                          <option value="" disabled>-- Оберіть номер --</option>
                          {availableHotels.map(h => 
                            h.rooms?.map(r => (
                              <option key={r.id} value={r.id} disabled={!r.isFree && r.id !== booking.roomId}>
                                {h.name} - {translateRoomType(r.roomType)} (+{r.price} ₴) {!r.isFree && r.id !== booking.roomId ? '(Зайнято)' : ''}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <div className="font-semibold text-gray-800">{room ? `${hotelName} - ${translateRoomType(room.roomType)} (+${room.price} ₴)` : 'Не обрано'}</div>
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