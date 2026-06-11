using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelAgency.DAL.Entities;

namespace TravelAgency.DAL.Configurations
{
       public class TourConfiguration : IEntityTypeConfiguration<Tour>
       {
              public void Configure(EntityTypeBuilder<Tour> builder)
              {
                     builder.HasKey(t => t.Id);

                     builder.Property(t => t.Name)
                         .IsRequired()
                         .HasMaxLength(200);

                     builder.Property(t => t.City)
                         .IsRequired()
                         .HasMaxLength(100);

                     builder.Property(t => t.Description)
                         .HasMaxLength(1000);

                     builder.Property(t => t.Price)
                         .HasColumnType("decimal(18,2)")
                         .IsRequired();

                     builder.Property(t => t.Promotion)
                         .HasColumnType("decimal(18,2)");

                     builder.Property(t => t.Date)
                         .IsRequired();

                     builder.Property(t => t.Type)
                         .IsRequired()
                         .HasConversion<int>();

                     builder.Property(t => t.IsHot)
                         .IsRequired();

                     builder.HasMany(t => t.Tickets)
                         .WithOne(ti => ti.Tour)
                         .HasForeignKey(ti => ti.TourId)
                         .OnDelete(DeleteBehavior.Cascade);

                     builder.HasMany(t => t.Bookings)
                         .WithOne(b => b.Tour)
                         .HasForeignKey(b => b.TourId)
                         .OnDelete(DeleteBehavior.Restrict);
              }
       }
}