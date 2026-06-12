using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.WebApi.Models.Requests
{
    public class ChangeRoleRequest
    {
        public Role NewRole { get; set; }
    }
}