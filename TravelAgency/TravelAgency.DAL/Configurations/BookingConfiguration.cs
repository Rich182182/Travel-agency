using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelAgency.DAL.Entities;

namespace TravelAgency.DAL.Configurations
{
       public class BookingConfiguration : IEntityTypeConfiguration<Booking>
       {
              public void Configure(EntityTypeBuilder<Booking> builder)
              {
                     builder.HasKey(b => b.Id);

                     builder.Property(b => b.TotalPrice)
                            .HasColumnType("decimal(18,2)")
                            .IsRequired();

                     builder.HasOne(b => b.Tour)
                            .WithMany(t => t.Bookings)
                            .HasForeignKey(b => b.TourId)
                            .OnDelete(DeleteBehavior.Restrict);

                     builder.HasOne(b => b.Room)
                            .WithMany(r => r.Bookings)
                            .HasForeignKey(b => b.RoomId)
                            .OnDelete(DeleteBehavior.SetNull);

                     builder.HasOne(b => b.Ticket)
                            .WithMany()
                            .HasForeignKey(b => b.TicketId)
                            .OnDelete(DeleteBehavior.SetNull);
              }
       }
}