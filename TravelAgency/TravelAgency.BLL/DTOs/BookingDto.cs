using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelAgency.BLL.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public int? RoomId { get; set; }
        public int UserId { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
