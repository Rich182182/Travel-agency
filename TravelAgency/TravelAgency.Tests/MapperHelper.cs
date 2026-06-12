using AutoMapper;
using Moq;
using System.Collections.Generic;
using System.Linq;
using TravelAgency.BLL.DTOs;
using TravelAgency.DAL.Entities;

namespace TravelAgency.Tests.Helpers;

public static class MapperHelper
{
    public static IMapper CreateMapper()
    {
        var mapperMock = new Mock<IMapper>();

        mapperMock
            .Setup(m => m.Map<TourDto>(It.IsAny<Tour>()))
            .Returns((Tour source) => source == null ? null! : new TourDto
            {
                Id = source.Id,
                Name = source.Name,
                City = source.City,
                Price = source.Price,
                Description = source.Description,
                IsHot = source.IsHot,
                Promotion = source.Promotion
            });

        mapperMock
            .Setup(m => m.Map<IEnumerable<TourDto>>(It.IsAny<IEnumerable<Tour>>()))
            .Returns((IEnumerable<Tour> source) => source?.Select(t => new TourDto
            {
                Id = t.Id,
                Name = t.Name,
                City = t.City,
                Price = t.Price,
                Description = t.Description,
                IsHot = t.IsHot,
                Promotion = t.Promotion
            })!);

        mapperMock
            .Setup(m => m.Map<Tour>(It.IsAny<CreateTourDto>()))
            .Returns((CreateTourDto source) => source == null ? null! : new Tour
            {
                Name = source.Name,
                City = source.City,
                Price = source.Price,
                Description = source.Description,
                IsHot = source.Promotion.HasValue && source.Promotion.Value > 0,
                Promotion = source.Promotion
            });
        mapperMock
            .Setup(m => m.Map<BookingDto>(It.IsAny<Booking>()))
            .Returns((Booking source) => source == null ? null! : new BookingDto
            {
                Id = source.Id,
                TourId = source.TourId,
                RoomId = source.RoomId,
                TicketId = source.TicketId,
                TotalPrice = source.TotalPrice
            });

        mapperMock
            .Setup(m => m.Map<IEnumerable<BookingDto>>(It.IsAny<IEnumerable<Booking>>()))
            .Returns((IEnumerable<Booking> source) => source?.Select(b => new BookingDto
            {
                Id = b.Id,
                TourId = b.TourId,
                RoomId = b.RoomId,
                TicketId = b.TicketId,
                TotalPrice = b.TotalPrice
            })!);

        mapperMock
            .Setup(m => m.Map<Booking>(It.IsAny<CreateBookingDto>()))
            .Returns((CreateBookingDto source) => source == null ? null! : new Booking
            {
                TourId = source.TourId,
                RoomId = source.RoomId,
                TicketId = source.TicketId
            });

        mapperMock
            .Setup(m => m.Map<Booking>(It.IsAny<UpdateBookingDto>()))
            .Returns((UpdateBookingDto source) => source == null ? null! : new Booking
            {
                RoomId = source.RoomId,
                TicketId = source.TicketId
            });

        return mapperMock.Object;
    }
}