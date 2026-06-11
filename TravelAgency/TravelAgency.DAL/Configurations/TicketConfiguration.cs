using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelAgency.DAL.Entities;

namespace TravelAgency.DAL.Configurations
{
    public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(EntityTypeBuilder<Ticket> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Price)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(t => t.Date)
                .IsRequired();

            builder.Property(t => t.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.HasOne(t => t.Tour)
                .WithMany(t => t.Tickets)
                .HasForeignKey(t => t.TourId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}