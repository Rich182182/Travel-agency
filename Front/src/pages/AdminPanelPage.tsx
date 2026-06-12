import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserCog, Map, Building, Edit, Trash2, Plus, Save, X, Loader } from 'lucide-react';
import { ToursAPI, HotelsAPI, RoomsAPI, UsersAPI } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import { parseBackendError } from '../api/errorHandler';
import type { User, Role, Tour, Hotel } from '../types';

export default function AdminPanelPage() {
  const { user } = useAuth();
  const { showToast, openConfirm } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'users' | 'tours' | 'hotels'>(user?.role === 'Admin' ? 'users' : 'tours');
  
  const [users, setUsers] = useState<User[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  // ДОДАНО: Зберігаємо оригінальний стан туру, щоб порівнювати зміни
  const [originalTour, setOriginalTour] = useState<Tour | null>(null); 
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [toursRes, hotelsRes] = await Promise.all([
        ToursAPI.getAll(),
        HotelsAPI.getAll()
      ]);
      setTours(toursRes.data);
      setHotels(hotelsRes.data);
      
      if (user?.role === 'Admin') {
        const usersRes = await UsersAPI.getAll();
        setUsers(usersRes.data);
      }
    } catch (error) {
      showToast(parseBackendError(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return (
      <div className="text-center mt-20 text-red-500 flex flex-col items-center gap-4">
        <ShieldAlert size={48} />
        <h2 className="text-2xl font-bold">Доступ заборонено</h2>
      </div>
    );
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await UsersAPI.changeRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as Role } : u));
      showToast('Роль успішно змінено!', 'success');
    } catch (error) {
      showToast(parseBackendError(error), 'error');
    }
  };

  const normalizeRole = (roleStr?: string) => {
    if (!roleStr) return 'Registered';
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
  };

  const formatTourType = (typeStr?: string): 'Regular' | 'Excursion' => {
    if (!typeStr) return 'Regular';
    const formatted = typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase();
    return (formatted === 'Excursion') ? 'Excursion' : 'Regular';
  };

  // Розділяємо процес збереження на 2 етапи: перевірка і сам запит
  const handleSaveTourClick = () => {
    if (!editingTour) return;

    if (!editingTour.name?.trim()) return showToast("Будь ласка, введіть назву туру.", "error");
    if (!editingTour.city?.trim()) return showToast("Будь ласка, вкажіть місто.", "error");
    if (!editingTour.description?.trim()) return showToast("Будь ласка, додайте опис туру.", "error");
    if (!editingTour.price || Number(editingTour.price) <= 0) return showToast("Базова ціна туру має бути більшою за нуль.", "error");
    if (editingTour.tickets.length === 0) return showToast("Додайте хоча б один тип квитка (Авіа або Автобус).", "error");

    for (const ticket of editingTour.tickets) {
      if (!ticket.price || Number(ticket.price) <= 0) {
        return showToast(`Вкажіть коректну ціну для квитка "${ticket.type}".`, "error");
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const selectedDateStr = editingTour.date.split('T')[0];

    if (selectedDateStr < todayStr) {
      showToast('Помилка! Не можна створити або зберегти тур із минулою датою.', 'error');
      return;
    }

    // ДОДАНО: Перевірка на зміну критичних полів існуючого туру
    if (editingTour.id !== 0 && originalTour) {
      const typeChanged = formatTourType(editingTour.type) !== formatTourType(originalTour.type);
      const cityChanged = editingTour.city.trim() !== originalTour.city.trim();

      if (typeChanged || cityChanged) {
        openConfirm(
          "Критична зміна даних!",
          "Ви змінюєте тип туру або його місто. Якщо цей тур вже заброньовано клієнтами, це може спричинити серйозні помилки в їхніх особистих кабінетах! Рекомендується не змінювати ці параметри, а створити новий тур. Ви впевнені, що хочете продовжити?",
          () => executeTourSave()
        );
        return; // Зупиняємо функцію, чекаємо підтвердження
      }
    }

    executeTourSave();
  };

  // Безпосереднє збереження на сервер
  const executeTourSave = async () => {
    if (!editingTour) return;
    try {
      const payload = {
        name: editingTour.name.trim(),
        price: Number(editingTour.price),
        city: editingTour.city.trim(),
        description: editingTour.description.trim(),
        date: new Date(editingTour.date).toISOString(),
        type: formatTourType(editingTour.type), 
        promotion: editingTour.isHot ? (Number(editingTour.promotion) || 0) : 0,
        tickets: editingTour.tickets.map(t => {
          let backendType = t.type;
          if (backendType === 'Авіа (Літак)') backendType = 'Airplane';
          if (backendType === 'Автобус') backendType = 'Bus';

          const ticketPayload = {
            type: backendType || "Airplane",
            price: Number(t.price) || 0
          };
          
          if (editingTour.id !== 0 && t.id !== 0) {
            (ticketPayload as any).id = t.id;
          }
          return ticketPayload;
        })
      };

      if (editingTour.id === 0) {
        await ToursAPI.create(payload);
      } else {
        await ToursAPI.update(editingTour.id, payload);
      }
      
      showToast('Тур успішно збережено!', 'success');
      setEditingTour(null);
      setOriginalTour(null);
      fetchAllData(); 
    } catch (error: any) {
      showToast(parseBackendError(error), 'error');
    }
  };

  const deleteTour = (id: number) => {
    openConfirm(
      'Видалити тур?',
      'Ви впевнені, що хочете видалити цей тур? Цю дію неможливо скасувати.',
      async () => {
        try {
          await ToursAPI.delete(id);
          setTours(tours.filter(t => t.id !== id));
          showToast('Тур видалено', 'success');
        } catch (error) {
          showToast(parseBackendError(error), 'error');
        }
      }
    );
  };

  const handleAddTicket = () => {
    if (!editingTour) return;
    const existingTypes = editingTour.tickets.map(t => 
      t.type === 'Авіа (Літак)' ? 'Airplane' : (t.type === 'Автобус' ? 'Bus' : t.type)
    );
    const hasAirplane = existingTypes.includes('Airplane');
    const hasBus = existingTypes.includes('Bus');

    if (hasAirplane && hasBus) return;

    const nextType = hasAirplane ? 'Bus' : 'Airplane';
    setEditingTour({
      ...editingTour, 
      tickets: [...editingTour.tickets, { id: 0, type: nextType, price: 0 }]
    });
  };

  const saveHotelAndRooms = async () => {
    if (!editingHotel) return;

    if (!editingHotel.name?.trim()) return showToast("Будь ласка, введіть назву готелю.", "error");
    if (!editingHotel.city?.trim()) return showToast("Будь ласка, вкажіть місто готелю.", "error");

    if (editingHotel.rooms && editingHotel.rooms.length > 0) {
      for (const room of editingHotel.rooms) {
        if (!room.price || Number(room.price) < 0) return showToast("Вкажіть коректну ціну для всіх номерів.", "error");
      }
    }

    try {
      if (editingHotel.id === 0) {
        await HotelsAPI.create({ name: editingHotel.name.trim(), city: editingHotel.city.trim() });
      } else {
        await HotelsAPI.update(editingHotel.id, { name: editingHotel.name.trim(), city: editingHotel.city.trim() });
        const roomsToSave = editingHotel.rooms || [];
        for (const room of roomsToSave) {
          if (room.id === 0) {
            await RoomsAPI.create(editingHotel.id, { roomType: room.roomType || 'Standart', price: Number(room.price) || 0 });
          } else {
            await RoomsAPI.update(room.id, { id: room.id, roomType: room.roomType || 'Standart', price: Number(room.price) || 0, isFree: room.isFree });
          }
        }
      }
      showToast('Готель збережено!', 'success');
      setEditingHotel(null);
      fetchAllData();
    } catch (error: any) {
      showToast(parseBackendError(error), 'error');
    }
  };

  const deleteHotel = (id: number) => {
    openConfirm(
      'Видалити готель?',
      'Разом з готелем будуть видалені всі його номери. Продовжити?',
      async () => {
        try {
          await HotelsAPI.delete(id);
          setHotels(hotels.filter(h => h.id !== id));
          showToast('Готель видалено', 'success');
        } catch (error) {
          showToast(parseBackendError(error), 'error');
        }
      }
    );
  };

  const deleteRoomInline = (roomId: number, index: number) => {
    if (!editingHotel) return;
    if (roomId === 0) {
      const newRooms = editingHotel.rooms?.filter((_, i) => i !== index);
      setEditingHotel({ ...editingHotel, rooms: newRooms });
      return;
    }
    
    openConfirm(
      'Видалити номер?',
      'Якщо на цей номер вже є активні бронювання, видалення буде неможливим.',
      async () => {
        try {
          await RoomsAPI.delete(roomId);
          const newRooms = editingHotel.rooms?.filter((_, i) => i !== index);
          setEditingHotel({ ...editingHotel, rooms: newRooms });
          showToast('Номер видалено', 'success');
        } catch (error: any) {
          showToast(parseBackendError(error), 'error');
        }
      }
    );
  };

  if (isLoading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Панель керування</h1>

      <div className="flex border-b mb-6 overflow-x-auto">
        {user.role === 'Admin' && (
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><UserCog size={20} /> Користувачі</button>
        )}
        <button onClick={() => setActiveTab('tours')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'tours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Map size={20} /> Тури</button>
        <button onClick={() => setActiveTab('hotels')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Building size={20} /> Готелі</button>
      </div>

      {/* ВКЛАДКА: КОРИСТУВАЧІ */}
      {activeTab === 'users' && user.role === 'Admin' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr><th className="p-4">ID</th><th className="p-4">Email</th><th className="p-4">Поточна роль</th><th className="p-4">Дії</th></tr>
            </thead>
            <tbody>
              {users.map(u => {
                const currentRole = normalizeRole(u.role);
                return (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{u.id}</td>
                    <td className="p-4 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${currentRole === 'Admin' ? 'bg-red-100 text-red-700' : currentRole === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {currentRole}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        className="p-1.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" 
                        value={currentRole} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)} 
                        disabled={u.id === user.id}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Registered">Registered</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА: ТУРИ */}
      {activeTab === 'tours' && (
        <div>
          {!editingTour ? (
            <>
              <button 
                onClick={() => {
                  setOriginalTour(null);
                  setEditingTour({ id: 0, name: '', price: 0, city: '', description: '', date: new Date().toISOString().split('T')[0], type: 'Regular', isHot: false, promotion: 0, tickets: [] });
                }} 
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Plus size={18} /> Додати тур
              </button>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b"><tr><th className="p-4">Назва</th><th className="p-4">Місто</th><th className="p-4">Ціна</th><th className="p-4">Дії</th></tr></thead>
                  <tbody>
                    {tours.map(t => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{t.name} {t.isHot && '🔥'}</td><td className="p-4 text-gray-600">{t.city}</td><td className="p-4">{t.price} ₴</td>
                        <td className="p-4 flex gap-2">
                          <button 
                            onClick={() => {
                              // Зберігаємо оригінал при відкритті
                              setOriginalTour({ ...t, date: t.date.split('T')[0], tickets: t.tickets || [] });
                              setEditingTour({ ...t, date: t.date.split('T')[0], tickets: t.tickets || [] });
                            }} 
                            className="p-2 bg-blue-100 text-blue-600 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteTour(t.id)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">{editingTour.id === 0 ? 'Новий тур' : 'Редагувати тур'}</h2><button onClick={() => { setEditingTour(null); setOriginalTour(null); }}><X size={24} /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Назва туру <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Наприклад: Вікенд у Парижі" value={editingTour.name} onChange={e => setEditingTour({...editingTour, name: e.target.value})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Місто проведення <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Наприклад: Париж" value={editingTour.city} onChange={e => setEditingTour({...editingTour, city: e.target.value})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Базова ціна (₴) <span className="text-red-500">*</span></label>
                  <input type="number" placeholder="Ціна" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: Number(e.target.value)})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Дата проведення <span className="text-red-500">*</span></label>
                  <input type="date" value={editingTour.date} onChange={e => setEditingTour({...editingTour, date: e.target.value})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Тип туру</label>
                  <select value={formatTourType(editingTour.type)} onChange={e => setEditingTour({...editingTour, type: e.target.value as any})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500">
                    <option value="Regular">Звичайний</option>
                    <option value="Excursion">Екскурсійний</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Промоакція</label>
                  <div className="flex items-center gap-4 border p-1.5 rounded min-h-[42px] bg-white">
                    <label className="flex items-center gap-2 cursor-pointer font-medium whitespace-nowrap pl-1 text-sm">
                      <input type="checkbox" checked={editingTour.isHot} onChange={e => setEditingTour({...editingTour, isHot: e.target.checked})} className="w-4 h-4 text-blue-600 shrink-0" />
                      Гарячий тур
                    </label>
                    <input 
                      type="number" 
                      placeholder="Знижка (₴)" 
                      value={editingTour.promotion || ''} 
                      onChange={e => setEditingTour({...editingTour, promotion: Number(e.target.value)})} 
                      className={`p-1.5 border rounded w-full focus:ring-2 focus:ring-blue-500 text-sm transition-opacity duration-200 ${editingTour.isHot ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}`} 
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Детальний опис туру <span className="text-red-500">*</span></label>
                  <textarea placeholder="Опишіть програму туру..." value={editingTour.description || ''} onChange={e => setEditingTour({...editingTour, description: e.target.value})} className="p-2 w-full border rounded h-24 focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </div>

              <div className="mb-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Квитки до цього туру <span className="text-red-500">*</span></h3>
                  
                  {editingTour.tickets.length < 2 ? (
                    <button onClick={handleAddTicket} className="text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                      + Додати квиток
                    </button>
                  ) : (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">Всі типи квитків додано</span>
                  )}
                </div>

                {editingTour.tickets.map((ticket, index) => {
                  const currentNormType = ticket.type === 'Авіа (Літак)' ? 'Airplane' : (ticket.type === 'Автобус' ? 'Bus' : ticket.type);
                  
                  const usedTypes = editingTour.tickets
                    .filter((_, i) => i !== index)
                    .map(t => t.type === 'Авіа (Літак)' ? 'Airplane' : (t.type === 'Автобус' ? 'Bus' : t.type));

                  return (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <select 
                        value={currentNormType} 
                        onChange={e => { 
                          const n = [...editingTour.tickets]; 
                          n[index].type = e.target.value; 
                          setEditingTour({...editingTour, tickets: n}); 
                        }} 
                        className="p-2 border rounded flex-grow bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {(!usedTypes.includes('Airplane') || currentNormType === 'Airplane') && <option value="Airplane">Авіа (Літак)</option>}
                        {(!usedTypes.includes('Bus') || currentNormType === 'Bus') && <option value="Bus">Автобус</option>}
                      </select>

                      <input 
                        type="number" 
                        placeholder="Ціна (₴)" 
                        value={ticket.price || ''} 
                        onChange={e => { 
                          const n = [...editingTour.tickets]; 
                          n[index].price = Number(e.target.value); 
                          setEditingTour({...editingTour, tickets: n}); 
                        }} 
                        className="p-2 border rounded w-32 focus:ring-2 focus:ring-blue-500" 
                      />
                      
                      <button onClick={() => setEditingTour({...editingTour, tickets: editingTour.tickets.filter((_, i) => i !== index)})} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Видалити квиток">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* ВИКЛИКАЄМО НОВУ ФУНКЦІЮ ПЕРЕВІРКИ */}
              <button onClick={handleSaveTourClick} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg"><Save size={20} className="inline mr-2" /> Зберегти тур</button>
            </div>
          )}
        </div>
      )}

      {/* ВКЛАДКА: ГОТЕЛІ */}
      {activeTab === 'hotels' && (
        <div>
          {!editingHotel ? (
            <>
              <button onClick={() => setEditingHotel({ id: 0, name: '', city: '', rooms: [] })} className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                <Plus size={18} /> Додати готель
              </button>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b"><tr><th className="p-4">Назва готелю</th><th className="p-4">Місто</th><th className="p-4">К-ть номерів</th><th className="p-4">Дії</th></tr></thead>
                  <tbody>
                    {hotels.map(h => (
                      <tr key={h.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{h.name}</td><td className="p-4 text-gray-600">{h.city}</td><td className="p-4">{h.rooms?.length || 0}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => setEditingHotel({ ...h, rooms: h.rooms || [] })} className="p-2 bg-blue-100 text-blue-600 rounded"><Edit size={16} /></button>
                          <button onClick={() => deleteHotel(h.id)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-xl border shadow-sm max-w-3xl">
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">{editingHotel.id === 0 ? 'Новий готель' : 'Редагувати готель'}</h2><button onClick={() => setEditingHotel(null)}><X size={24} /></button></div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-grow">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Назва готелю <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Назва" value={editingHotel.name} onChange={e => setEditingHotel({...editingHotel, name: e.target.value})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-grow">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Місто <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Місто (має збігатися з туром)" value={editingHotel.city} onChange={e => setEditingHotel({...editingHotel, city: e.target.value})} className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {editingHotel.id === 0 ? (
                 <div className="p-4 bg-blue-50 text-blue-700 rounded-lg mb-6 text-center">
                    Збережіть готель, щоб мати можливість додавати до нього номери.
                 </div>
              ) : (
                <div className="mb-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Номери готелю</h3>
                    <button onClick={() => setEditingHotel({...editingHotel, rooms: [...(editingHotel.rooms||[]), { id: 0, roomType: 'Standart', price: 0, isFree: true }]})} className="text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium">+ Додати номер</button>
                  </div>
                  {editingHotel.rooms?.map((room, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-2 mb-3 items-center bg-gray-50 p-2 rounded-lg border">
                      <select 
                        value={room.roomType || 'Standart'} 
                        onChange={e => { const n = [...editingHotel.rooms!]; n[index].roomType = e.target.value as any; setEditingHotel({...editingHotel, rooms: n}); }} 
                        className="p-2 border rounded flex-grow w-full md:w-auto focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Standart">Стандарт</option>
                        <option value="Lux">Люкс</option>
                        <option value="Deluxe">Делюкс</option>
                      </select>

                      <input type="number" placeholder="Ціна (₴) *" value={room.price || ''} onChange={e => { const n = [...editingHotel.rooms!]; n[index].price = Number(e.target.value); setEditingHotel({...editingHotel, rooms: n}); }} className="p-2 border rounded w-full md:w-32 focus:ring-2 focus:ring-blue-500" />
                      
                      <button onClick={() => deleteRoomInline(room.id, index)} className="p-2 text-red-500 hover:bg-red-100 rounded w-full md:w-auto flex justify-center ml-auto" title="Видалити номер"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={saveHotelAndRooms} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg"><Save size={20} className="inline mr-2" /> Зберегти готель {editingHotel.id !== 0 && "та номери"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}