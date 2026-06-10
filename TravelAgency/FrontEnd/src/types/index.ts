export type TourType = 'Regular' | 'Excursion';
export type Role = 'Admin' | 'Manager' | 'Registered' | 'Guest';

export interface User {
  id: string;
  email: string;
  password?: string; // Додано пароль для автентифікації
  role: Role;
}

export interface Ticket {
  id: string;
  type: string;
  price: number;
  date: string;
}

export interface Room {
  id: string;
  name: string;
  price: number;
  isFree: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  rooms: Room[];
}

export interface Tour {
  id: string;
  name: string;
  price: number;
  city: string;
  description: string;
  date: string;
  tourType: TourType;
  isHot: boolean;
  discount?: number;
  tickets: Ticket[];
}

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  ticketId: string;
  hotelId?: string;
  roomId?: string;
  totalPrice: number;
} 