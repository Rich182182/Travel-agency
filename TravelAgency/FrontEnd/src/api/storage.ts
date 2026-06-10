import { mockTours, mockHotels, mockBookings } from './mockData';
import type { Tour, Hotel, Booking, User } from '../types';

export const getUsers = (): User[] => {
  const data = localStorage.getItem('users');
  if (data) return JSON.parse(data);
  const defaultUsers: User[] = [
    { id: '1', email: 'admin@mail.com', password: '123456', role: 'Admin' },
    { id: '2', email: 'manager@mail.com', password: '123456', role: 'Manager' },
    { id: '3', email: 'client@mail.com', password: '123456', role: 'Registered' }
  ];
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const saveUsers = (users: User[]) => localStorage.setItem('users', JSON.stringify(users));

export const getTours = (): Tour[] => {
  const data = localStorage.getItem('tours');
  if (data) return JSON.parse(data);
  localStorage.setItem('tours', JSON.stringify(mockTours));
  return mockTours;
};

export const saveTours = (tours: Tour[]) => localStorage.setItem('tours', JSON.stringify(tours));

export const getHotels = (): Hotel[] => {
  const data = localStorage.getItem('hotels');
  if (data) return JSON.parse(data);
  localStorage.setItem('hotels', JSON.stringify(mockHotels));
  return mockHotels;
};

export const saveHotels = (hotels: Hotel[]) => localStorage.setItem('hotels', JSON.stringify(hotels));

// НОВА ФУНКЦІЯ: Зміна статусу кімнати (вільна/зайнята)
export const updateRoomAvailability = (hotelId: string, roomId: string, isFree: boolean) => {
  const hotels = getHotels();
  const updatedHotels = hotels.map(h => {
    if (h.id === hotelId) {
      return {
        ...h,
        rooms: h.rooms.map(r => r.id === roomId ? { ...r, isFree } : r)
      };
    }
    return h;
  });
  saveHotels(updatedHotels);
};

export const getBookings = (): Booking[] => {
  const data = localStorage.getItem('bookings');
  if (data) return JSON.parse(data);
  localStorage.setItem('bookings', JSON.stringify(mockBookings));
  return mockBookings;
};

export const saveBookings = (bookings: Booking[]) => localStorage.setItem('bookings', JSON.stringify(bookings));