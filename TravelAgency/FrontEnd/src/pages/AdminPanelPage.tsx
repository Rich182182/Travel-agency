import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserCog, Map, Building, Edit, Trash2, Plus, Save, X, Loader } from 'lucide-react';
import { ToursAPI, HotelsAPI, RoomsAPI, UsersAPI } from '../api/client';
import type { User, Role, Tour, Hotel } from '../types';

export default function AdminPanelPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'users' | 'tours' | 'hotels'>(user?.role === 'Admin' ? 'users' : 'tours');
  
  const [users, setUsers] = useState<User[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingTour, setEditingTour] = useState<Tour | null>(null);
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
      console.error("Помилка завантаження даних адмін-панелі", error);
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

  // --- CRUD ДЛЯ КОРИСТУВАЧІВ ---
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await UsersAPI.changeRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as Role } : u));
      alert('Роль успішно змінено!');
    } catch (error) {
      alert('Помилка при зміні ролі');
    }
  };

  // --- CRUD ДЛЯ ТУРІВ ---
  const saveTour = async () => {
    if (!editingTour) return;
    
    try {
      const payload = {
        name: editingTour.name || "Без назви",
        price: Number(editingTour.price) || 0,
        city: editingTour.city || "Не вказано",
        description: editingTour.description || "",
        date: new Date(editingTour.date || Date.now()).toISOString(),
        type: editingTour.type,
        promotion: editingTour.isHot ? (Number(editingTour.promotion) || 0) : 0,
        tickets: editingTour.tickets.map(t => ({
          id: t.id === 0 ? undefined : t.id,
          type: t.type || "Стандарт",
          price: Number(t.price) || 0
        }))
      };

      if (editingTour.id === 0) {
        await ToursAPI.create(payload);
      } else {
        await ToursAPI.update(editingTour.id, payload);
      }
      
      alert('Тур успішно збережено!');
      setEditingTour(null);
      fetchAllData(); 
    } catch (error: any) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join('\n');
        alert(`Помилка валідації C#:\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || 'Помилка збереження');
      }
    }
  };

  const deleteTour = async (id: number) => {
    if (!window.confirm('Видалити тур?')) return;
    try {
      await ToursAPI.delete(id);
      setTours(tours.filter(t => t.id !== id));
    } catch (error) {
      alert('Помилка при видаленні туру');
    }
  };

  // --- CRUD ДЛЯ ГОТЕЛІВ ТА НОМЕРІВ ---
  const saveHotelAndRooms = async () => {
    if (!editingHotel) return;
    try {
      if (editingHotel.id === 0) {
        await HotelsAPI.create({ name: editingHotel.name, city: editingHotel.city });
      } else {
        await HotelsAPI.update(editingHotel.id, { name: editingHotel.name, city: editingHotel.city });
        const roomsToSave = editingHotel.rooms || [];
        for (const room of roomsToSave) {
          if (room.id === 0) {
            await RoomsAPI.create(editingHotel.id, { name: room.name, price: Number(room.price) || 0 });
          } else {
            await RoomsAPI.update(room.id, { ...room, price: Number(room.price) || 0 });
          }
        }
      }
      alert('Готель збережено!');
      setEditingHotel(null);
      fetchAllData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Помилка при збереженні готелю');
    }
  };

  const deleteHotel = async (id: number) => {
    if (!window.confirm('Видалити готель?')) return;
    try {
      await HotelsAPI.delete(id);
      setHotels(hotels.filter(h => h.id !== id));
    } catch (error) {
      alert('Помилка при видаленні готелю');
    }
  };

  const deleteRoomInline = async (roomId: number, index: number) => {
    if (!editingHotel) return;
    if (roomId === 0) {
      const newRooms = editingHotel.rooms?.filter((_, i) => i !== index);
      setEditingHotel({ ...editingHotel, rooms: newRooms });
      return;
    }
    if (!window.confirm('Видалити цей номер з бази?')) return;
    try {
      await RoomsAPI.delete(roomId);
      const newRooms = editingHotel.rooms?.filter((_, i) => i !== index);
      setEditingHotel({ ...editingHotel, rooms: newRooms });
    } catch (error) {
      alert('Помилка при видаленні номера');
    }
  };

  // Допоміжна функція для нормалізації ролей
  const normalizeRole = (roleStr?: string) => {
    if (!roleStr) return 'Registered';
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
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
                        {currentRole !== 'Admin' && currentRole !== 'Manager' && currentRole !== 'Registered' && (
                          <option value={currentRole}>{currentRole}</option>
                        )}
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
              <button onClick={() => setEditingTour({ id: 0, name: '', price: 0, city: '', description: '', date: new Date().toISOString().split('T')[0], type: 'Regular', isHot: false, promotion: 0, tickets: [] })} className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
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
                          <button onClick={() => setEditingTour({ ...t, date: t.date.split('T')[0], tickets: t.tickets || [] })} className="p-2 bg-blue-100 text-blue-600 rounded"><Edit size={16} /></button>
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
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">{editingTour.id === 0 ? 'Новий тур' : 'Редагувати тур'}</h2><button onClick={() => setEditingTour(null)}><X size={24} /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Назва туру" value={editingTour.name} onChange={e => setEditingTour({...editingTour, name: e.target.value})} className="p-2 border rounded" />
                <input type="text" placeholder="Місто" value={editingTour.city} onChange={e => setEditingTour({...editingTour, city: e.target.value})} className="p-2 border rounded" />
                <input type="number" placeholder="Базова ціна (₴)" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: Number(e.target.value)})} className="p-2 border rounded" />
                <input type="date" value={editingTour.date} onChange={e => setEditingTour({...editingTour, date: e.target.value})} className="p-2 border rounded" />
                
                <select value={editingTour.type} onChange={e => setEditingTour({...editingTour, type: e.target.value as any})} className="p-2 border rounded">
                  <option value="Regular">Звичайний</option><option value="Excursion">Екскурсійний</option>
                </select>
                
                <div className="flex items-center gap-4 border p-2 rounded">
                  <label className="flex items-center gap-2 cursor-pointer font-medium"><input type="checkbox" checked={editingTour.isHot} onChange={e => setEditingTour({...editingTour, isHot: e.target.checked})} className="w-4 h-4 text-blue-600" />Гарячий тур</label>
                  {editingTour.isHot && <input type="number" placeholder="Знижка (₴)" value={editingTour.promotion || ''} onChange={e => setEditingTour({...editingTour, promotion: Number(e.target.value)})} className="p-1 border rounded w-32" />}
                </div>
                <textarea placeholder="Опис туру" value={editingTour.description || ''} onChange={e => setEditingTour({...editingTour, description: e.target.value})} className="p-2 border rounded md:col-span-2 h-24"></textarea>
              </div>

              <div className="mb-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Квитки до цього туру</h3>
                  <button onClick={() => setEditingTour({...editingTour, tickets: [...editingTour.tickets, { id: 0, type: '', price: 0 }]})} className="text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium">+ Додати квиток</button>
                </div>
                {editingTour.tickets.map((ticket, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input type="text" placeholder="Тип (напр. Авіа Економ)" value={ticket.type} onChange={e => { const n = [...editingTour.tickets]; n[index].type = e.target.value; setEditingTour({...editingTour, tickets: n}); }} className="p-2 border rounded flex-grow" />
                    <input type="number" placeholder="Ціна (₴)" value={ticket.price || ''} onChange={e => { const n = [...editingTour.tickets]; n[index].price = Number(e.target.value); setEditingTour({...editingTour, tickets: n}); }} className="p-2 border rounded w-32" />
                    <button onClick={() => setEditingTour({...editingTour, tickets: editingTour.tickets.filter((_, i) => i !== index)})} className="p-2 text-red-500"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button onClick={saveTour} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg"><Save size={20} className="inline mr-2" /> Зберегти тур</button>
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
                <input type="text" placeholder="Назва готелю" value={editingHotel.name} onChange={e => setEditingHotel({...editingHotel, name: e.target.value})} className="p-2 border rounded flex-grow" />
                <input type="text" placeholder="Місто (для турів)" value={editingHotel.city} onChange={e => setEditingHotel({...editingHotel, city: e.target.value})} className="p-2 border rounded flex-grow" />
              </div>

              {editingHotel.id === 0 ? (
                 <div className="p-4 bg-blue-50 text-blue-700 rounded-lg mb-6 text-center">
                    Збережіть готель, щоб мати можливість додавати до нього номери.
                 </div>
              ) : (
                <div className="mb-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Номери готелю</h3>
                    <button onClick={() => setEditingHotel({...editingHotel, rooms: [...(editingHotel.rooms||[]), { id: 0, name: '', price: 0, isFree: true }]})} className="text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium">+ Додати номер</button>
                  </div>
                  {editingHotel.rooms?.map((room, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-2 mb-3 items-center bg-gray-50 p-2 rounded-lg border">
                      <input type="text" placeholder="Назва" value={room.name} onChange={e => { const n = [...editingHotel.rooms!]; n[index].name = e.target.value; setEditingHotel({...editingHotel, rooms: n}); }} className="p-2 border rounded flex-grow w-full md:w-auto" />
                      <input type="number" placeholder="Ціна (₴)" value={room.price || ''} onChange={e => { const n = [...editingHotel.rooms!]; n[index].price = Number(e.target.value); setEditingHotel({...editingHotel, rooms: n}); }} className="p-2 border rounded w-full md:w-32" />
                      
                      {room.id === 0 ? (
                         <span className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-medium border border-green-100">Вільний (за замовчуванням)</span>
                      ) : (
                        <label className="flex items-center gap-2 text-sm bg-white border p-2 rounded w-full md:w-auto cursor-pointer">
                          <input type="checkbox" checked={room.isFree} onChange={e => { const n = [...editingHotel.rooms!]; n[index].isFree = e.target.checked; setEditingHotel({...editingHotel, rooms: n}); }} className="w-4 h-4 text-blue-600" /> Вільний
                        </label>
                      )}

                      <button onClick={() => deleteRoomInline(room.id, index)} className="p-2 text-red-500 hover:bg-red-100 rounded w-full md:w-auto flex justify-center"><Trash2 size={18} /></button>
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