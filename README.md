# 🌍 Travel Agency — Full-Stack Web Application

A full-stack travel agency booking platform built with **ASP.NET Core 9** and **React 19**. The system allows users to browse tours, book tickets and hotel rooms, manage favorites, and provides an admin panel for full content management.

---

## Overview

This project was built as a complete solution for a travel agency business, covering the full user journey — from browsing available tours to completing a booking with transport tickets and hotel rooms. The backend follows a clean **3-layer architecture** (DAL → BLL → API), while the frontend is a modern **SPA** built with React and TypeScript.

---

## ✨ Features

### For Users
- 🔍 **Browse & Search** — filter tours by city, type (Regular / Excursion), and "hot" deals
- 📋 **Tour Details** — view full tour info, select transport tickets and hotel rooms
- 🏨 **Smart Booking** — book with automatic room availability check and city-match validation
- 💳 **My Bookings** — view, edit, and cancel personal bookings with live cost recalculation
- ❤️ **Favorites** — save tours to a personal favorites list (persisted per user session)
- 👤 **Auth** — JWT-based registration, login, and account deletion

### For Admins / Managers
- 🗺️ **Tour Management** — create, edit, delete tours with tickets and hot-deal promotions
- 🏩 **Hotel & Room Management** — full CRUD for hotels and their rooms with type/price control
- 👥 **User Management** — view all users and change their roles (Admin only)
- 🔒 **Role-based Access** — three roles: `Client`, `Manager`, `Admin`

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **ASP.NET Core 9** | REST API framework |
| **Entity Framework Core 9** | ORM and database migrations |
| **MS SQL Server** | Relational database |
| **AutoMapper 16** | DTO ↔ Entity mapping |
| **BCrypt.Net** | Password hashing |
| **JWT Bearer** | Authentication & authorization |
| **FluentValidation** | Input validation |
| **Docker / Docker Compose** | SQL Server containerization |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Static typing |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### Testing
| Technology | Purpose |
|---|---|
| **xUnit** | Test framework |
| **Moq** | Mocking dependencies |
| **AutoMapper** | Mapper setup in tests |

---

## 🏗 Architecture

The backend follows a strict **3-layer architecture**:

```
┌─────────────────────────────────────┐
│         TravelAgency.WebApi         │  ← Controllers, Request/Response models
│         (Presentation Layer)        │     JWT Auth, Global Exception Handler
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          TravelAgency.BLL           │  ← Services, DTOs, AutoMapper profiles
│       (Business Logic Layer)        │     Validation, Business rules
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          TravelAgency.DAL           │  ← EF Core, Entities, Migrations
│        (Data Access Layer)          │     Repository pattern, Unit of Work
└─────────────────────────────────────┘
```

### Design Patterns Used
- **Repository Pattern** — abstract data access behind `IRepository<T>`
- **Unit of Work** — coordinates multiple repositories in one transaction
- **DTO Pattern** — separate request/response models from domain entities
- **Dependency Injection** — all services registered via `IServiceCollection`

---

## 🚀 Getting Started

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/travel-agency.git
cd travel-agency
```

### 2. Start the database

```bash
docker-compose up -d
```

This starts a **MS SQL Server 2022** container on port `1433` with the credentials already configured in `appsettings.json`.

### 3. Run the backend

```bash
cd TravelAgency/TravelAgency.WebApi
dotnet run
```

The API will start on `http://localhost:5160`. On first launch, the database is automatically migrated and seeded with sample data (tours, hotels, rooms, tickets) and a default admin account.

> **Default Admin:** `admin@gmail.com` / `123`

### 4. Run the frontend

```bash
cd Front
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/Auth/register` | ❌ | Register a new user |
| `POST` | `/api/Auth/login` | ❌ | Login and receive JWT token |
| `GET` | `/api/Auth/me` | ✅ | Get current user info |
| `DELETE` | `/api/Auth/me` | ✅ | Delete own account |

### Tours
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/Tours` | ❌ | Get all tours |
| `GET` | `/api/Tours/{id}` | ❌ | Get tour by ID |
| `GET` | `/api/Tours/hot` | ❌ | Get hot/promo tours |
| `GET` | `/api/Tours/type/{type}` | ❌ | Filter by type |
| `GET` | `/api/Tours/city/{city}` | ❌ | Filter by city |
| `POST` | `/api/Tours` | 🔐 Manager/Admin | Create a tour |
| `PUT` | `/api/Tours/{id}` | 🔐 Manager/Admin | Update a tour |
| `DELETE` | `/api/Tours/{id}` | 🔐 Manager/Admin | Delete a tour |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/Bookings` | ✅ | Create a booking |
| `GET` | `/api/Bookings/my` | ✅ | Get my bookings |
| `PUT` | `/api/Bookings/{id}` | ✅ | Update booking |
| `DELETE` | `/api/Bookings/{id}` | ✅ | Cancel booking |

### Hotels & Rooms
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/Hotels` | ❌ | Get all hotels with rooms |
| `POST` | `/api/Hotels` | 🔐 Manager/Admin | Create hotel |
| `PUT` | `/api/Hotels/{id}` | 🔐 Manager/Admin | Update hotel |
| `DELETE` | `/api/Hotels/{id}` | 🔐 Manager/Admin | Delete hotel |
| `GET` | `/api/Rooms/hotel/{hotelId}` | ❌ | Get rooms by hotel |
| `POST` | `/api/Rooms/{hotelId}` | 🔐 Manager/Admin | Add room |
| `PUT` | `/api/Rooms/{id}` | 🔐 Manager/Admin | Update room |
| `DELETE` | `/api/Rooms/{id}` | 🔐 Manager/Admin | Delete room |

### Favorites & Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/Favorites` | ✅ | Get my favorites |
| `POST` | `/api/Favorites` | ✅ | Add to favorites |
| `DELETE` | `/api/Favorites/{tourId}` | ✅ | Remove from favorites |
| `GET` | `/api/Users` | 🔐 Admin | Get all users |
| `PATCH` | `/api/Users/{id}/role` | 🔐 Admin | Change user role |

---

## 📁 Project Structure

```
Travel-agency/
├── TravelAgency/                        # Backend (.NET solution)
│   ├── TravelAgency.DAL/                # Data Access Layer
│   │   ├── Entities/                    # Domain entities + Enums
│   │   ├── Configurations/              # EF Core entity configs
│   │   ├── Migrations/                  # EF Core migrations
│   │   ├── Repositories/               # Repository + UnitOfWork
│   │   └── AppDbContext.cs
│   ├── TravelAgency.BLL/               # Business Logic Layer
│   │   ├── DTOs/                       # Data Transfer Objects
│   │   ├── Interfaces/                 # Service interfaces
│   │   ├── Mapping/                    # AutoMapper profiles
│   │   ├── Services/                   # Business logic implementations
│   │   └── Exceptions/                 # Custom exceptions
│   ├── TravelAgency.WebApi/            # Presentation Layer
│   │   ├── Controllers/                # API Controllers
│   │   ├── Models/                     # Request/Response models
│   │   ├── Mapping/                    # WebApi AutoMapper profiles
│   │   ├── Infrastructure/             # Global exception handler
│   │   └── Program.cs
│   ├── TravelAgency.Tests/             # Unit Tests
│   │   └── Services/
│   │       ├── BookingServiceTests.cs
│   │       └── TourServiceTests.cs
│   └── docker-compose.yml
│
└── Front/                              # Frontend (React)
    ├── src/
    │   ├── api/                        # Axios client + error handler
    │   ├── components/                 # Reusable components (Navbar)
    │   ├── context/                    # AuthContext, NotificationContext
    │   ├── hooks/                      # useFavorites
    │   ├── pages/                      # Page components
    │   │   ├── ToursListPage.tsx
    │   │   ├── TourDetailsPage.tsx
    │   │   ├── MyBookingsPage.tsx
    │   │   ├── FavoritesPage.tsx
    │   │   ├── AdminPanelPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   └── types/                      # TypeScript interfaces
    └── vite.config.ts
```

---

## 🧪 Testing

Unit tests cover the two core business services using **xUnit** + **Moq**.

```bash
cd TravelAgency/TravelAgency.Tests
dotnet test
```

### Test Coverage

**`BookingServiceTests`** — 14 tests
- ✅ Create booking with ticket and price calculation
- ✅ Hot tour promotion applied correctly
- ✅ Room booked and marked as occupied
- ✅ Room freed on booking cancellation
- ✅ Validation: occupied room, city mismatch, foreign ticket, tour not found
- ✅ Update booking: room swap with old room freed, new room occupied

**`TourServiceTests`** — 22 tests
- ✅ Create tour with auto `IsHot` flag based on promotion
- ✅ Validation: empty name/city, zero price, past date, no tickets
- ✅ Get by ID, get all, filter by city (case-insensitive), filter by type
- ✅ Hot tours filter, empty result throws `NotFoundException`
- ✅ Delete blocked when active bookings exist
- ✅ Update blocked when changing city/type with existing bookings

---

## 🔐 Security

- Passwords are hashed with **BCrypt** (cost factor 11)
- Authentication via **JWT tokens** (HS256, 2-hour expiry)
- Role-based authorization on all sensitive endpoints
- CORS configured for the React dev server origin
- Global exception handler returns `ProblemDetails` — no internal stack traces exposed to clients

---

## 🌱 Database Seeding

On first launch the app automatically seeds:
- **1 Admin** account (`admin@gmail.com` / `1234567`)
- **26 Hotels** across 9 cities (Київ, Варшава, Краків, Париж, Рим, Анталія, Стамбул, Барселона, Дубай)
- **130+ Rooms** of types Standard / Deluxe / Lux with randomized prices
- **16 Tours** (Regular + Excursion) spread across future dates
- **Tickets** for each tour (Airplane, Bus, Train depending on destination)
