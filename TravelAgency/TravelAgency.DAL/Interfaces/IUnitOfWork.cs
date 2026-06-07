using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading.Tasks;
using TravelAgency.DAL.Entities;

namespace TravelAgency.DAL.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<User> Users { get; }
        IRepository<Booking> Bookings { get; }
        IRepository<Hotel> Hotels { get; }
        IRepository<Room> Rooms { get; }
        IRepository<Tour> Tours { get; }
        IRepository<Ticket> Tickets { get; }
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}