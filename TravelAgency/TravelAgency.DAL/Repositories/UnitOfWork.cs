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
        private IRepository<User> _userRepository;
        private IRepository<Booking> _bookingRepository;
        private IRepository<Hotel> _hotelRepository;
        private IRepository<Room> _roomRepository;
        private IRepository<Tour> _tourRepository;
        private IRepository<Ticket> _ticketRepository;

        public UnitOfWork(AppDbContext context,
            IRepository<User> userRepository,
            IRepository<Booking> bookingRepository,
            IRepository<Hotel> hotelRepository, 
            IRepository<Room> roomRepository,
            IRepository<Tour> tourRepository,
            IRepository<Ticket> ticketRepository)
        {
            _context = context;
            _userRepository = userRepository;
            _bookingRepository = bookingRepository;
            _hotelRepository = hotelRepository;
            _roomRepository = roomRepository;
            _tourRepository = tourRepository;
            _ticketRepository = ticketRepository;
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