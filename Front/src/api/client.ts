import axios from 'axios';

// Создаем экземпляр axios с базовым URL твоего .NET бекенда
const api = axios.create({
  baseURL: 'http://localhost:5160', // Укажи здесь порт своего бекенда, если он отличается
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик (Interceptor), который автоматически добавляет JWT токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- AUTH API ---
export const AuthAPI = {
  register: (data: any) => api.post('/api/Auth/register', data),
  login: (data: any) => api.post('/api/Auth/login', data),
  getMe: () => api.get('/api/Auth/me'),
  deleteMe: () => api.delete('/api/Auth/me'),
};

// --- TOURS API ---
export const ToursAPI = {
  getAll: () => api.get('/api/Tours'),
  getById: (id: number) => api.get(`/api/Tours/${id}`),
  create: (data: any) => api.post('/api/Tours', data),
  update: (id: number, data: any) => api.put(`/api/Tours/${id}`, data),
  delete: (id: number) => api.delete(`/api/Tours/${id}`),
  getHot: () => api.get('/api/Tours/hot'),
  getByType: (type: string) => api.get(`/api/Tours/type/${type}`),
  getByCity: (city: string) => api.get(`/api/Tours/city/${city}`),
};

// --- BOOKINGS API ---
export const BookingsAPI = {
  create: (data: any) => api.post('/api/Bookings', data),
  update: (id: number, data: any) => api.put(`/api/Bookings/${id}`, data),
  delete: (id: number) => api.delete(`/api/Bookings/${id}`),
  getMyBookings: () => api.get('/api/Bookings/my'),
};

// --- FAVORITES API ---
export const FavoritesAPI = {
  getAll: () => api.get('/api/Favorites'),
  add: (data: { tourId: number }) => api.post('/api/Favorites', data),
  delete: (tourId: number) => api.delete(`/api/Favorites/${tourId}`),
};

// --- HOTELS API ---
export const HotelsAPI = {
  getAll: () => api.get('/api/Hotels'),
  getById: (id: number) => api.get(`/api/Hotels/${id}`),
  create: (data: any) => api.post('/api/Hotels', data),
  update: (id: number, data: any) => api.put(`/api/Hotels/${id}`, data),
  delete: (id: number) => api.delete(`/api/Hotels/${id}`),
};

// --- ROOMS API (ОБНОВЛЕНО ПОД SWAGGER) ---
export const RoomsAPI = {
  getById: (id: number) => api.get(`/api/Rooms/${id}`),
  getByHotel: (hotelId: number) => api.get(`/api/Rooms/hotel/${hotelId}`),
  
  // Принимает roomType ("Standart" | "Lux" | "Deluxe") вместо name
  create: (hotelId: number, data: { roomType: string; price: number }) => 
    api.post(`/api/Rooms/${hotelId}`, data),
  
  // Принимает roomType ("Standart" | "Lux" | "Deluxe") вместо name
  update: (id: number, data: { id: number; roomType: string; price: number; isFree: boolean }) => 
    api.put(`/api/Rooms/${id}`, data),
    
  delete: (id: number) => api.delete(`/api/Rooms/${id}`),
};

// --- USERS API ---
export const UsersAPI = {
  getAll: () => api.get('/api/Users'),
  changeRole: (id: number, newRole: string) => 
    api.patch(`/api/Users/${id}/role`, { newRole }),
};

export default api;