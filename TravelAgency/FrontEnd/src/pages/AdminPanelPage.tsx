import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserCog, Map, Building, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { getTours, saveTours, getHotels, saveHotels, getUsers, saveUsers } from '../api/storage';
import type { User, Role, Tour, Hotel } from '../types';

export default function AdminPanelPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'users' | 'tours' | 'hotels'>(user?.role === 'Admin' ? 'users' : 'tours');
  
  // Стейти для даних
  const [users, setUsers] = useState<User[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  // Підтягуємо всі дані з localStorage при завантаженні
  useEffect(() => {
    setUsers(getUsers());
    setTours(getTours());
    setHotels(getHotels());
  }, []);

  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Перевірка прав доступу
  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return (
      <div className="text-center mt-20 text-red-500 flex flex-col items-center gap-4">
        <ShieldAlert size={48} />
        <h2 className="text-2xl font-bold">Доступ заборонено</h2>
      </div>
    );
  }

  // --- CRUD ДЛЯ ТУРІВ ---
  const saveTour = () => {
    if (!editingTour) return;
    const newTours = tours.find(t => t.id === editingTour.id) 
      ? tours.map(t => t.id === editingTour.id ? editingTour : t)
      : [...tours, { ...editingTour, id: `t_${Date.now()}` }];
    
    setTours(newTours);
    saveTours(newTours); // Збереження в LocalStorage
    setEditingTour(null);
    alert('Тур збережено!');
  };

  const deleteTour = (id: string) => {
    if (window.confirm('Видалити тур?')) {
      const newTours = tours.filter(t => t.id !== id);
      setTours(newTours);
      saveTours(newTours);
    }
  };

  // --- CRUD ДЛЯ ГОТЕЛІВ ---
  const saveHotel = () => {
    if (!editingHotel) return;
    const newHotels = hotels.find(h => h.id === editingHotel.id)
      ? hotels.map(h => h.id === editingHotel.id ? editingHotel : h)
      : [...hotels, { ...editingHotel, id: `h_${Date.now()}` }];
    
    setHotels(newHotels);
    saveHotels(newHotels); // Збереження в LocalStorage
    setEditingHotel(null);
    alert('Готель збережено!');
  };

  const deleteHotel = (id: string) => {
    if (window.confirm('Видалити готель?')) {
      const newHotels = hotels.filter(h => h.id !== id);
      setHotels(newHotels);
      saveHotels(newHotels);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Панель керування</h1>

      {/* Навігація вкладок */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {user.role === 'Admin' && (
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <UserCog size={20} /> Користувачі
          </button>
        )}
        <button onClick={() => setActiveTab('tours')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'tours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Map size={20} /> Тури
        </button>
        <button onClick={() => setActiveTab('hotels')} className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 ${activeTab === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Building size={20} /> Готелі
        </button>
      </div>

      {/* 1. ВКЛАДКА: КОРИСТУВАЧІ */}
      {activeTab === 'users' && user.role === 'Admin' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Email</th>
                <th className="p-4 font-semibold text-gray-600">Роль</th>
                <th className="p-4 font-semibold text-gray-600">Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-4 font-medium text-gray-800">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      u.role === 'Admin' ? 'bg-red-100 text-red-700' :
                      u.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <select 
                      className="p-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={u.role} 
                      onChange={(e) => {
                        const newUsers = users.map(userObj => userObj.id === u.id ? { ...userObj, role: e.target.value as Role } : userObj);
                        setUsers(newUsers);
                        saveUsers(newUsers); // Зберігаємо зміну ролі у LocalStorage
                      }} 
                      disabled={u.id === user.id} // Не можна змінити роль самому собі
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Registered">Registered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. ВКЛАДКА: ТУРИ */}
      {activeTab === 'tours' && (
        <div>
          {!editingTour ? (
            <>
              <button onClick={() => setEditingTour({ id: '', name: '', price: 0, city: '', description: '', date: '', tourType: 'Regular', isHot: false, tickets: [] })} className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                <Plus size={18} /> Додати тур
              </button>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr><th className="p-4">Назва</th><th className="p-4">Місто</th><th className="p-4">Ціна</th><th className="p-4">Дії</th></tr>
                  </thead>
                  <tbody>
                    {tours.map(t => (
                      <tr key={t.id} className="border-b">
                        <td className="p-4 font-medium">{t.name} {t.isHot && '🔥'}</td>
                        <td className="p-4 text-gray-600">{t.city}</td>
                        <td className="p-4">{t.price} ₴</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => setEditingTour(t)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Edit size={16} /></button>
                          <button onClick={() => deleteTour(t.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* ФОРМА ТУРУ */
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingTour.id ? 'Редагувати тур' : 'Новий тур'}</h2>
                <button onClick={() => setEditingTour(null)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Назва туру" value={editingTour.name} onChange={e => setEditingTour({...editingTour, name: e.target.value})} className="p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Місто" value={editingTour.city} onChange={e => setEditingTour({...editingTour, city: e.target.value})} className="p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Базова ціна (₴)" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: Number(e.target.value)})} className="p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={editingTour.date} onChange={e => setEditingTour({...editingTour, date: e.target.value})} className="p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                
                <select value={editingTour.tourType} onChange={e => setEditingTour({...editingTour, tourType: e.target.value as 'Regular' | 'Excursion'})} className="p-2 border rounded focus:ring-2 focus:ring-blue-500">
                  <option value="Regular">Звичайний</option>
                  <option value="Excursion">Екскурсійний</option>
                </select>
                
                <div className="flex items-center gap-4 border p-2 rounded">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" checked={editingTour.isHot} onChange={e => setEditingTour({...editingTour, isHot: e.target.checked})} className="w-4 h-4 text-blue-600" />
                    Гарячий тур
                  </label>
                  {editingTour.isHot && (
                    <input type="number" placeholder="Знижка (₴)" value={editingTour.discount || ''} onChange={e => setEditingTour({...editingTour, discount: Number(e.target.value)})} className="p-1 border rounded w-24 focus:ring-2 focus:ring-blue-500" />
                  )}
                </div>
                <textarea placeholder="Опис туру" value={editingTour.description} onChange={e => setEditingTour({...editingTour, description: e.target.value})} className="p-2 border rounded md:col-span-2 h-24 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              {/* CRUD КВИТКІВ ДЛЯ ТУРУ */}
              <div className="mb-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Квитки до цього туру</h3>
                  <button onClick={() => setEditingTour({...editingTour, tickets: [...editingTour.tickets, { id: `tk_${Date.now()}`, type: '', price: 0, date: editingTour.date }]})} className="text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                    + Додати квиток
                  </button>
                </div>
                {editingTour.tickets.map((ticket, index) => (
                  <div key={ticket.id} className="flex gap-2 mb-2 items-center">
                    <input type="text" placeholder="Тип (напр. Авіа Економ)" value={ticket.type} onChange={e => {
                      const newTickets = [...editingTour.tickets];
                      newTickets[index].type = e.target.value;
                      setEditingTour({...editingTour, tickets: newTickets});
                    }} className="p-2 border rounded flex-grow" />
                    <input type="number" placeholder="Ціна (₴)" value={ticket.price || ''} onChange={e => {
                      const newTickets = [...editingTour.tickets];
                      newTickets[index].price = Number(e.target.value);
                      setEditingTour({...editingTour, tickets: newTickets});
                    }} className="p-2 border rounded w-32" />
                    <button onClick={() => {
                      const newTickets = editingTour.tickets.filter((_, i) => i !== index);
                      setEditingTour({...editingTour, tickets: newTickets});
                    }} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>

              <button onClick={saveTour} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 transition-colors">
                <Save size={20} /> Зберегти тур
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. ВКЛАДКА: ГОТЕЛІ */}
      {activeTab === 'hotels' && (
        <div>
          {!editingHotel ? (
            <>
              <button onClick={() => setEditingHotel({ id: '', name: '', city: '', rooms: [] })} className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                <Plus size={18} /> Додати готель
              </button>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr><th className="p-4">Назва готелю</th><th className="p-4">Місто</th><th className="p-4">К-ть номерів</th><th className="p-4">Дії</th></tr>
                  </thead>
                  <tbody>
                    {hotels.map(h => (
                      <tr key={h.id} className="border-b">
                        <td className="p-4 font-medium text-gray-800">{h.name}</td>
                        <td className="p-4 text-gray-600">{h.city}</td>
                        <td className="p-4">{h.rooms.length}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => setEditingHotel(h)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Edit size={16} /></button>
                          <button onClick={() => deleteHotel(h.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* ФОРМА ГОТЕЛЮ */
            <div className="bg-white p-6 rounded-xl border shadow-sm max-w-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingHotel.id ? 'Редагувати готель' : 'Новий готель'}</h2>
                <button onClick={() => setEditingHotel(null)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input type="text" placeholder="Назва готелю" value={editingHotel.name} onChange={e => setEditingHotel({...editingHotel, name: e.target.value})} className="p-2 border rounded flex-grow focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Місто (для прив'язки до турів)" value={editingHotel.city} onChange={e => setEditingHotel({...editingHotel, city: e.target.value})} className="p-2 border rounded flex-grow focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* CRUD НОМЕРІВ */}
              <div className="mb-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Номери готелю</h3>
                  <button onClick={() => setEditingHotel({...editingHotel, rooms: [...editingHotel.rooms, { id: `rm_${Date.now()}`, name: '', price: 0, isFree: true }]})} className="text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                    + Додати номер
                  </button>
                </div>
                {editingHotel.rooms.map((room, index) => (
                  <div key={room.id} className="flex flex-col md:flex-row gap-2 mb-3 items-center bg-gray-50 p-2 rounded-lg border">
                    <input type="text" placeholder="Назва (напр. Люкс)" value={room.name} onChange={e => {
                      const newRooms = [...editingHotel.rooms];
                      newRooms[index].name = e.target.value;
                      setEditingHotel({...editingHotel, rooms: newRooms});
                    }} className="p-2 border rounded flex-grow w-full md:w-auto" />
                    
                    <input type="number" placeholder="Ціна (₴)" value={room.price || ''} onChange={e => {
                      const newRooms = [...editingHotel.rooms];
                      newRooms[index].price = Number(e.target.value);
                      setEditingHotel({...editingHotel, rooms: newRooms});
                    }} className="p-2 border rounded w-full md:w-32" />
                    
                    <label className="flex items-center gap-2 text-sm bg-white border p-2 rounded w-full md:w-auto cursor-pointer">
                      <input type="checkbox" checked={room.isFree} onChange={e => {
                        const newRooms = [...editingHotel.rooms];
                        newRooms[index].isFree = e.target.checked;
                        setEditingHotel({...editingHotel, rooms: newRooms});
                      }} className="w-4 h-4 text-blue-600" />
                      Вільний
                    </label>
                    
                    <button onClick={() => {
                      const newRooms = editingHotel.rooms.filter((_, i) => i !== index);
                      setEditingHotel({...editingHotel, rooms: newRooms});
                    }} className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors w-full md:w-auto flex justify-center"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>

              <button onClick={saveHotel} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 transition-colors">
                <Save size={20} /> Зберегти готель
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}