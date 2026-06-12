using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Entities.Enums; // Не забудь додати цей юзінг для Enum

namespace TravelAgency.BLL.Services
{
    public class DbInitializationService : IDbInitializationService
    {
        private readonly AppDbContext _context;

        public DbInitializationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task InitializeAsync()
        {
            // 1. Накочуємо міграції
            await _context.Database.MigrateAsync();

            // 2. Створюємо Адміна
            await SeedAdminAsync();

            // 3. Створюємо Тестові дані
            await SeedDataAsync();
        }

        private async Task SeedAdminAsync()
        {
            if (!await _context.Users.AnyAsync(u => u.Email == "admin@gmail.com"))
            {
                var admin = new User
                {
                    Email = "admin@gmail.com",
                    Role = Role.Admin,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123")
                };

                await _context.Users.AddAsync(admin);
                await _context.SaveChangesAsync();
            }
        }

        private async Task SeedDataAsync()
        {
            // Якщо в базі вже є тури, не генеруємо дані повторно
            if (await _context.Tours.AnyAsync()) return;

            var random = new Random();

            // --- 1. ГOTEЛI (Масштабний список для різних міст) ---
            var hotelsInfo = new List<(string Name, string City)>
            {
                ("Premier Palace", "Київ"), ("InterContinental", "Київ"), ("Fairmont Grand", "Київ"), ("Holiday Inn", "Київ"),
                ("Marriott Warsaw", "Варшава"), ("Novotel Centrum", "Варшава"), ("Radisson Blu", "Варшава"),
                ("Sheraton Grand", "Краків"), ("Hotel Stary", "Краків"),
                ("Hilton Paris Opera", "Париж"), ("Ritz Paris", "Париж"), ("Pullman Tour Eiffel", "Париж"),
                ("Hassler Roma", "Рим"), ("Hotel Artemide", "Рим"), ("Rome Cavalieri", "Рим"),
                ("Rixos Downtown", "Анталія"), ("Titanic Mardan Palace", "Анталія"), ("Regnum Carya", "Анталія"),
                ("Swissotel The Bosphorus", "Стамбул"), ("Ciragan Palace", "Стамбул"), ("Four Seasons", "Стамбул"),
                ("W Barcelona", "Барселона"), ("Majestic Hotel", "Барселона"),
                ("Armani Hotel", "Дубай"), ("Burj Al Arab", "Дубай"), ("Atlantis The Palm", "Дубай")
            };

            var hotels = hotelsInfo.Select(h => new Hotel { Name = h.Name, City = h.City }).ToList();
            await _context.Hotels.AddRangeAsync(hotels);
            await _context.SaveChangesAsync(); // Зберігаємо, щоб отримати Id готелів для кімнат

            // --- 2. КIМНАТИ (Генеруємо циклом для КОЖНОГО готелю) ---
            var rooms = new List<Room>();
            foreach (var hotel in hotels)
            {
                // Базові стандартні кімнати (дешевші)
                rooms.Add(new Room { HotelId = hotel.Id, RoomType = RoomType.Standard, Price = random.Next(1500, 3000), IsFree = true });
                rooms.Add(new Room { HotelId = hotel.Id, RoomType = RoomType.Standard, Price = random.Next(1500, 3000), IsFree = true }); // З імовірністю 30% зайнята

                // Делюкс кімнати
                rooms.Add(new Room { HotelId = hotel.Id, RoomType = RoomType.Deluxe, Price = random.Next(3500, 6000), IsFree = true });
                rooms.Add(new Room { HotelId = hotel.Id, RoomType = RoomType.Deluxe, Price = random.Next(3500, 6000), IsFree = true });

                // Люкс номери (найдорожчі)
                rooms.Add(new Room { HotelId = hotel.Id, RoomType = RoomType.Lux, Price = random.Next(7000, 15000), IsFree = true });

                // Іноді (з імовірністю 40%) додаємо ще один дуже дорогий президентський люкс
                if (random.Next(100) > 60)
                {
                    rooms.Add(new Room { HotelId = hotel.Id, RoomType = RoomType.Lux, Price = random.Next(16000, 25000), IsFree = true });
                }
            }
            await _context.Rooms.AddRangeAsync(rooms);

            // --- 3. ТУРИ ---
            var toursInfo = new List<(string Name, string City, decimal Price, string Desc, TourType Type, bool IsHot, decimal? Promo)>
            {
                // Київ
                ("Вікенд у Києві", "Київ", 4500, "Оглядова екскурсія історичним центром столиці, Поділ, Хрещатик.", TourType.Excursion, false, null),
                ("Гастрономічний Київ", "Київ", 6000, "Дегустація в найкращих ресторанах грузинської та італійської кухні.", TourType.Excursion, true, 1000),
                
                // Польща
                ("Шопінг та прогулянки", "Варшава", 12000, "Ідеальні вихідні у старому місті Варшави.", TourType.Regular, false, null),
                ("Королівський Краків", "Краків", 14000, "Екскурсія до Вавельського замку та атмосферними вуличками.", TourType.Excursion, true, 2000),
                
                // Франція
                ("Романтичний Париж", "Париж", 28000, "Тиждень у серці Франції, Ейфелева вежа та круїз по Сені.", TourType.Excursion, false, null),
                ("Мистецтво та Лувр", "Париж", 25000, "Поглиблена екскурсія музеями Парижа.", TourType.Excursion, true, 3000),
                
                // Італія
                ("Античний Рим", "Рим", 22000, "Колізей, Пантеон та найкраща італійська архітектура.", TourType.Excursion, false, null),
                ("Міланський шопінг", "Мілан", 35000, "Прогулянки модними бутіками Італії.", TourType.Regular, false, null),
                ("Римські канікули", "Рим", 18000, "Швидкий гарячий тур на 3 дні.", TourType.Excursion, true, 4000),

                // Туреччина
                ("All Inclusive", "Анталія", 32000, "Сімейний відпочинок на березі моря.", TourType.Regular, false, null),
                ("Гаряча Анталія", "Анталія", 40000, "Преміум відпочинок 5 зірок, 10 днів.", TourType.Regular, true, 7000),
                ("Контрасти Стамбула", "Стамбул", 19000, "Босфор, Гранд Базар та Блакитна мечеть.", TourType.Excursion, true, 2500),

                // Іспанія
                ("Сонячна Барселона", "Барселона", 29000, "Творіння Гауді та пляжі Середземного моря.", TourType.Regular, false, null),
                ("Каталонія", "Барселона", 26000, "Екскурсія на гори Монсеррат та архітектура міста.", TourType.Excursion, true, 3000),

                // ОАЕ
                ("Розкішний Дубай", "Дубай", 55000, "Відпочинок у місті майбутнього, Бурдж Халіфа.", TourType.Regular, false, null),
                ("Дубай Експрес", "Дубай", 42000, "Гаряча пропозиція на 5 днів в Еміратах.", TourType.Regular, true, 8000)
            };

            var tours = new List<Tour>();
            int dayOffset = 1;
            foreach (var t in toursInfo)
            {
                tours.Add(new Tour
                {
                    Name = t.Name,
                    City = t.City,
                    Price = t.Price,
                    Description = t.Desc,
                    Type = t.Type,
                    IsHot = t.IsHot,
                    Promotion = t.Promo,
                    Date = DateTime.UtcNow.AddDays(dayOffset)
                });
                dayOffset += 3; // Розподіляємо дати турів у майбутньому (кожен наступний тур на 3 дні пізніше)
            }
            await _context.Tours.AddRangeAsync(tours);
            await _context.SaveChangesAsync(); // Зберігаємо, щоб тури отримали Id

            // --- 4. КВИТКИ (Генерація транспортних опцій) ---
            var tickets = new List<Ticket>();
            foreach (var tour in tours)
            {
                // Авіаквитки: додаємо для всіх міст, окрім Києва
                if (tour.City != "Київ")
                {
                    tickets.Add(new Ticket { TourId = tour.Id, Type = TicketType.Airplane, Price = random.Next(4000, 12000), Date = tour.Date.AddDays(-1) });
                }

                // Автобус: додаємо як дешевшу альтернативу для Європи та Туреччини
                if (new[] { "Варшава", "Краків", "Стамбул", "Рим" }.Contains(tour.City))
                {
                    tickets.Add(new Ticket { TourId = tour.Id, Type = TicketType.Bus, Price = random.Next(1500, 3500), Date = tour.Date.AddDays(-2) });
                }

                // Потяг: доступно для близьких напрямків
                if (new[] { "Київ", "Варшава", "Краків" }.Contains(tour.City))
                {
                    tickets.Add(new Ticket { TourId = tour.Id, Type = TicketType.Train, Price = random.Next(800, 2500), Date = tour.Date.AddDays(-1) });
                }
            }
            await _context.Tickets.AddRangeAsync(tickets);

            // Зберігаємо всі згенеровані кімнати та квитки остаточно
            await _context.SaveChangesAsync();
        }
    }
}