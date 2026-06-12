namespace TravelAgency.WebApi.Models.Requests
{
    public class AddFavoriteRequest
    {
        public int? TourId { get; set; }
        public int? Id { get; set; }

        public int GetValidId()
        {
            if (TourId.HasValue && TourId.Value != 0) return TourId.Value;
            if (Id.HasValue && Id.Value != 0) return Id.Value;
            return 0;
        }
    }
}