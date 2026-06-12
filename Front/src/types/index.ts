export type Role = 'Admin' | 'Manager' | 'Client';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export type TicketType = 'Airplane' | 'Bus' | 'Train' | 'Ship';

export interface Ticket {
  id: number;
  type: TicketType; 
  price: number;
}

export interface Tour {
  id: number;
  name: string;
  city: string;
  description: string;
  price: number;
  date: string;
  type: 'Regular' | 'Excursion';
  isHot: boolean;
  promotion: number;
  tickets: Ticket[];
}

export type RoomType = 'Standart' | 'Lux' | 'Deluxe';

export interface Room {
  id: number;
  roomType: RoomType;
  price: number;
  isFree: boolean;
  hotelId?: number;
}

export interface Hotel {
  id: number;
  name: string;
  city: string;
  rooms?: Room[];
}

export interface Booking {
  id: number;
  tourId: number;
  ticketId?: number;
  roomId?: number;
}