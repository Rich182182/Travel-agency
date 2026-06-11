import axios from 'axios';
import type { Tour, Hotel, Room, Booking, User, Ticket } from '../types';

// Зміни порт на той, на якому крутиться твій Docker (зазвичай 5000, 5001 або 8080)
const API_URL = 'http://localhost:5160'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = {
  login: (data: any) => api.post('/api/Auth/login', data),
  register: (data: any) => api.post('/api/Auth/register', data),
  getMe: () => api.get<User>('/api/Auth/me')
};

export const ToursAPI = {
  getAll: () => api.get<Tour[]>('/api/Tours'),
  getHot: () => api.get<Tour[]>('/api/Tours/hot'),
  getById: (id: number) => api.get<Tour>(`/api/Tours/${id}`),
  create: (data: Partial<Tour>) => api.post('/api/Tours', data),
  update: (id: number, data: Partial<Tour>) => api.put(`/api/Tours/${id}`, data),
  delete: (id: number) => api.delete(`/api/Tours/${id}`)
};

export const HotelsAPI = {
  getAll: () => api.get<Hotel[]>('/api/Hotels'),
  getById: (id: number) => api.get<Hotel>(`/api/Hotels/${id}`),
  create: (data: { name: string; city: string }) => api.post('/api/Hotels', data),
  update: (id: number, data: { name: string; city: string }) => api.put(`/api/Hotels/${id}`, data),
  delete: (id: number) => api.delete(`/api/Hotels/${id}`)
};

export const RoomsAPI = {
  getByHotel: (hotelId: number) => api.get<Room[]>(`/api/Rooms/hotel/${hotelId}`),
  create: (hotelId: number, data: { name: string; price: number }) => api.post(`/api/Rooms/${hotelId}`, data),
  update: (id: number, data: Room) => api.put(`/api/Rooms/${id}`, data),
  delete: (id: number) => api.delete(`/api/Rooms/${id}`)
};

export const BookingsAPI = {
  getMyBookings: () => api.get<Booking[]>('/api/Bookings/my'),
  create: (data: { tourId: number; roomId?: number; ticketId?: number }) => api.post('/api/Bookings', data),
  update: (id: number, data: { roomId?: number; ticketId?: number }) => api.put(`/api/Bookings/${id}`, data),
  delete: (id: number) => api.delete(`/api/Bookings/${id}`)
};

export const UsersAPI = {
  getAll: () => api.get<User[]>('/api/Users'),
  changeRole: (id: number, newRole: string) => api.patch(`/api/Users/${id}/role`, { newRole })
};