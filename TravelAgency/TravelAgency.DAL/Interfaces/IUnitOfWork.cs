using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading.Tasks;
using TravelAgency.DAL.Entities;

namespace TravelAgency.DAL.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}