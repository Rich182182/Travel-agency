using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;

namespace TravelAgency.DAL.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction _currentTransaction;
        public IRepository<User> Users { get; }
        public IRepository<Booking> Bookings { get; }
        public IRepository<Hotel> Hotels { get; }
        public IRepository<Room> Rooms { get; }
        public IRepository<Tour> Tours { get; }
        public IRepository<Ticket> Tickets { get; }

        public UnitOfWork(
            AppDbContext context,
            IRepository<User> users,
            IRepository<Booking> bookings,
            IRepository<Hotel> hotels,
            IRepository<Room> rooms,
            IRepository<Tour> tours,
            IRepository<Ticket> tickets)
        {
            _context = context;
            Users = users;
            Bookings = bookings;
            Hotels = hotels;
            Rooms = rooms;
            Tours = tours;
            Tickets = tickets;
        }


        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            if (_currentTransaction != null)
            {
                throw new InvalidOperationException("Транзакция уже запущена.");
            }
            _currentTransaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                await SaveChangesAsync();
                await _currentTransaction.CommitAsync();
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
            }
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                await _currentTransaction.RollbackAsync();
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
            }
        }

        public void Dispose()
        {
            _context.Dispose();
            _currentTransaction?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}