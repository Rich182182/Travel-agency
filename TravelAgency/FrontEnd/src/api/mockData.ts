import type { Tour, Hotel, Booking } from '../types';

export const mockHotels: Hotel[] = [
  {
    id: 'h1',
    name: 'Le Meurice',
    city: 'Париж',
    rooms: [
      { id: 'r1', name: 'Стандарт', price: 5000, isFree: true },
      { id: 'r2', name: 'Люкс', price: 12000, isFree: false }
    ]
  },
  {
    id: 'h2',
    name: 'Rixos Sharm',
    city: 'Шарм-ель-Шейх',
    rooms: [
      { id: 'r3', name: 'Стандарт з видом на море', price: 4000, isFree: true },
      { id: 'r4', name: 'Сімейний', price: 7000, isFree: true }
    ]
  }
];

export const mockTours: Tour[] = [
  {
    id: '1',
    name: 'Романтичний Париж',
    price: 15000,
    city: 'Париж',
    description: 'Незабутній тур на 3 дні. Відвідування Ейфелевої вежі, Лувру.',
    date: '2024-05-10',
    tourType: 'Regular',
    isHot: true,
    discount: 2000,
    tickets: [
      { id: 't1', type: 'Авіа (Економ)', price: 8000, date: '2024-05-10' }
    ]
  },
  {
    id: '2',
    name: 'Замки Закарпаття',
    price: 3500,
    city: 'Мукачево',
    description: 'Екскурсійна програма.',
    date: '2024-06-15',
    tourType: 'Excursion',
    isHot: false,
    tickets: [
      { id: 't3', type: 'Потяг (Купе)', price: 800, date: '2024-06-14' }
    ]
  }
];

export const mockBookings: Booking[] = [];