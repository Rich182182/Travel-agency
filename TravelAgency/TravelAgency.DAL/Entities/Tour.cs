using System;
using System.Collections.Generic;
using System.Net.Sockets;
using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.DAL.Entities
{
    public class Tour : BaseEntity
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string City { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public TourType Type { get; set; }
        public bool IsHot { get; set; }
        public decimal? Promotion { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}