namespace TravelAgency.DAL.Entities
{
    public class FavoriteTour:BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public int TourId { get; set; }
        public Tour Tour { get; set; }
    }
}