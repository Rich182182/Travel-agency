using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelAgency.DAL.Entities;

namespace TravelAgency.DAL.Configurations
{
       public class FavoriteConfiguration : IEntityTypeConfiguration<FavoriteTour>
       {
              public void Configure(EntityTypeBuilder<FavoriteTour> builder)
              {
                     builder.HasKey(ft => new { ft.UserId, ft.TourId });
              }
       }
}