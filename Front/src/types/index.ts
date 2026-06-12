export type TourType = 'Regular' | 'Excursion';
export type Role = 'Admin' | 'Manager' | 'Registered' | 'Guest';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Ticket {
  id?: number;
  type: string;
  price: number;
}

export interface Room {
  id: number;
  name: string;
  price: number;
  isFree: boolean;
}

export interface Hotel {
  id: number;
  name: string;
  city: string;
  rooms?: Room[];
}

export interface Tour {
  id: number;
  name: string;
  price: number;
  city: string;
  description: string;
  date: string;
  type: TourType;
  promotion?: number;
  tickets: Ticket[];
  isHot?: boolean; // Якщо бекенд повертає це поле
}

export interface Booking {
  id: number;
  tourId: number;
  ticketId?: number;
  roomId?: number;
  totalPrice?: number;
}