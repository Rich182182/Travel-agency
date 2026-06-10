using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelAgency.BLL.DTOs
{
    public class UpdateBookingDto
    {
        public int? RoomId { get; set; }
        public int? TicketId { get; set; }
    }
}
