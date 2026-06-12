using AutoMapper;
using Moq;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.BLL.Mapping;
using TravelAgency.BLL.Services;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Entities.Enums;
using TravelAgency.DAL.Interfaces;
using TravelAgency.Tests.Helpers;
using Xunit;

namespace TravelAgency.Tests.Services;

public class BookingServiceTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IRepository<Booking>> _bookingRepoMock;
    private readonly Mock<IRepository<Tour>> _tourRepoMock;
    private readonly Mock<IRepository<Room>> _roomRepoMock;
    private readonly Mock<IRepository<Ticket>> _ticketRepoMock;
    private readonly Mock<IRepository<Hotel>> _hotelRepoMock;
    private readonly IMapper _mapper;
    private readonly BookingService _service;

    public BookingServiceTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _bookingRepoMock = new Mock<IRepository<Booking>>();
        _tourRepoMock = new Mock<IRepository<Tour>>();
        _roomRepoMock = new Mock<IRepository<Room>>();
        _ticketRepoMock = new Mock<IRepository<Ticket>>();
        _hotelRepoMock = new Mock<IRepository<Hotel>>();

        _mapper = MapperHelper.CreateMapper();

        _uowMock.Setup(u => u.Bookings).Returns(_bookingRepoMock.Object);
        _uowMock.Setup(u => u.Tours).Returns(_tourRepoMock.Object);
        _uowMock.Setup(u => u.Rooms).Returns(_roomRepoMock.Object);
        _uowMock.Setup(u => u.Tickets).Returns(_ticketRepoMock.Object);
        _uowMock.Setup(u => u.Hotels).Returns(_hotelRepoMock.Object);

        _service = new BookingService(_uowMock.Object, _mapper);
    }

    [Fact]
    public async Task CreateBooking_WithValidTourAndTicket_ReturnsBookingDto()
    {
        var tour = new Tour { Id = 1, Price = 10000, City = "Київ" };
        var ticket = new Ticket { Id = 5, TourId = 1, Price = 2000, Type = TicketType.Airplane };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _ticketRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(ticket);
        _bookingRepoMock.Setup(r => r.AddAsync(It.IsAny<Booking>())).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new CreateBookingDto { TourId = 1, TicketId = 5 };

        var result = await _service.CreateBookingAsync(userId: 42, dto);

        Assert.NotNull(result);
        Assert.Equal(1, result.TourId);
        Assert.Equal(12000, result.TotalPrice);
    }

    [Fact]
    public async Task CreateBooking_TourNotFound_ThrowsNotFoundException()
    {
        _tourRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Tour?)null);

        var dto = new CreateBookingDto { TourId = 999 };

        await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateBookingAsync(1, dto));
    }

    [Fact]
    public async Task CreateBooking_WithHotTourPromotion_AppliesDiscount()
    {
        var tour = new Tour { Id = 1, Price = 10000, Promotion = 2000, City = "Київ" };
        var ticket = new Ticket { Id = 1, TourId = 1, Price = 1000, Type = TicketType.Bus };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _ticketRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(ticket);
        _bookingRepoMock.Setup(r => r.AddAsync(It.IsAny<Booking>())).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new CreateBookingDto { TourId = 1, TicketId = 1 };

        var result = await _service.CreateBookingAsync(1, dto);

        Assert.Equal(9000, result.TotalPrice);
    }

    [Fact]
    public async Task CreateBooking_WithRoom_AddsRoomPriceAndMarksBusy()
    {
        var tour = new Tour { Id = 1, Price = 5000, City = "Париж" };
        var hotel = new Hotel { Id = 1, City = "Париж" };
        var room = new Room { Id = 10, HotelId = 1, Price = 3000, IsFree = true };
        var ticket = new Ticket { Id = 2, TourId = 1, Price = 1500, Type = TicketType.Airplane };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _roomRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(room);
        _hotelRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);
        _ticketRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(ticket);
        _roomRepoMock.Setup(r => r.Update(It.IsAny<Room>()));
        _bookingRepoMock.Setup(r => r.AddAsync(It.IsAny<Booking>())).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new CreateBookingDto { TourId = 1, RoomId = 10, TicketId = 2 };

        var result = await _service.CreateBookingAsync(1, dto);

        Assert.Equal(9500, result.TotalPrice);
        Assert.False(room.IsFree);
        _roomRepoMock.Verify(r => r.Update(room), Times.Once);
    }

    [Fact]
    public async Task CreateBooking_RoomAlreadyOccupied_ThrowsValidationException()
    {
        var tour = new Tour { Id = 1, Price = 5000, City = "Рим" };
        var hotel = new Hotel { Id = 1, City = "Рим" };
        var room = new Room { Id = 3, HotelId = 1, Price = 2000, IsFree = false };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _roomRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(room);
        _hotelRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

        var dto = new CreateBookingDto { TourId = 1, RoomId = 3 };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateBookingAsync(1, dto));
    }

    [Fact]
    public async Task CreateBooking_RoomCityMismatch_ThrowsValidationException()
    {
        var tour = new Tour { Id = 1, Price = 5000, City = "Київ" };
        var hotel = new Hotel { Id = 1, City = "Варшава" };
        var room = new Room { Id = 4, HotelId = 1, Price = 1000, IsFree = true };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _roomRepoMock.Setup(r => r.GetByIdAsync(4)).ReturnsAsync(room);
        _hotelRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

        var dto = new CreateBookingDto { TourId = 1, RoomId = 4 };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateBookingAsync(1, dto));
    }

    [Fact]
    public async Task CreateBooking_TicketBelongsToAnotherTour_ThrowsValidationException()
    {
        var tour = new Tour { Id = 1, Price = 5000, City = "Київ" };
        var ticket = new Ticket { Id = 7, TourId = 99, Price = 1000, Type = TicketType.Bus };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _ticketRepoMock.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(ticket);

        var dto = new CreateBookingDto { TourId = 1, TicketId = 7 };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateBookingAsync(1, dto));
    }

    [Fact]
    public async Task CreateBooking_TicketNotFound_ThrowsNotFoundException()
    {
        var tour = new Tour { Id = 1, Price = 5000, City = "Київ" };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _ticketRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Ticket?)null);

        var dto = new CreateBookingDto { TourId = 1, TicketId = 888 };

        await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateBookingAsync(1, dto));
    }

    [Fact]
    public async Task DeleteBooking_ValidOwner_DeletesAndFreesRoom()
    {
        var room = new Room { Id = 5, IsFree = false };
        var booking = new Booking { Id = 1, UserId = 42, TourId = 1, RoomId = 5 };

        _bookingRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(booking);
        _roomRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(room);
        _roomRepoMock.Setup(r => r.Update(It.IsAny<Room>()));
        _bookingRepoMock.Setup(r => r.Delete(It.IsAny<Booking>()));
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        await _service.DeleteBookingAsync(userId: 42, bookingId: 1);

        Assert.True(room.IsFree);
        _bookingRepoMock.Verify(r => r.Delete(booking), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteBooking_BookingNotFound_ThrowsNotFoundException()
    {
        _bookingRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Booking?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteBookingAsync(1, 999));
    }

    [Fact]
    public async Task DeleteBooking_AnotherUsersBooking_ThrowsValidationException()
    {
        var booking = new Booking { Id = 1, UserId = 10 };

        _bookingRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(booking);

        await Assert.ThrowsAsync<ValidationException>(
            () => _service.DeleteBookingAsync(userId: 99, bookingId: 1));
    }

    [Fact]
    public async Task DeleteBooking_WithoutRoom_DeletesWithoutRoomUpdate()
    {
        var booking = new Booking { Id = 2, UserId = 5, RoomId = null };

        _bookingRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(booking);
        _bookingRepoMock.Setup(r => r.Delete(It.IsAny<Booking>()));
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        await _service.DeleteBookingAsync(userId: 5, bookingId: 2);

        _roomRepoMock.Verify(r => r.GetByIdAsync(It.IsAny<int>()), Times.Never);
        _bookingRepoMock.Verify(r => r.Delete(booking), Times.Once);
    }

    [Fact]
    public async Task GetUserBookings_NoBookings_ReturnsEmptyList()
    {
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Booking>());

        var result = await _service.GetUserBookingsAsync(userId: 1);

        Assert.Empty(result);
    }

    [Fact]
    public async Task UpdateBooking_ChangeRoom_FreesOldAndOccupiesNew()
    {
        var oldRoom = new Room { Id = 1, HotelId = 1, Price = 1000, IsFree = false };
        var newRoom = new Room { Id = 2, HotelId = 1, Price = 2000, IsFree = true };
        var hotel = new Hotel { Id = 1, City = "Київ" };
        var tour = new Tour { Id = 1, Price = 5000, City = "Київ" };
        var booking = new Booking { Id = 10, UserId = 1, TourId = 1, RoomId = 1 };
        var ticket = new Ticket { Id = 3, TourId = 1, Price = 500, Type = TicketType.Bus };

        _bookingRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(booking);
        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _roomRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(oldRoom);
        _roomRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(newRoom);
        _hotelRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);
        _ticketRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(ticket);
        _bookingRepoMock.Setup(r => r.Update(It.IsAny<Booking>()));
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new UpdateBookingDto { RoomId = 2, TicketId = 3 };
        var result = await _service.UpdateBookingAsync(userId: 1, bookingId: 10, dto);

        Assert.True(oldRoom.IsFree);
        Assert.False(newRoom.IsFree);
        Assert.Equal(7500, result.TotalPrice);
    }

    [Fact]
    public async Task UpdateBooking_NewRoomOccupied_ThrowsValidationException()
    {
        var oldRoom = new Room { Id = 1, HotelId = 1, Price = 1000, IsFree = false };
        var newRoom = new Room { Id = 2, HotelId = 1, Price = 2000, IsFree = false };
        var hotel = new Hotel { Id = 1, City = "Київ" };
        var tour = new Tour { Id = 1, Price = 5000, City = "Київ" };
        var booking = new Booking { Id = 10, UserId = 1, TourId = 1, RoomId = 1 };

        _bookingRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(booking);
        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _roomRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(oldRoom);
        _roomRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(newRoom);
        _hotelRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(hotel);

        var dto = new UpdateBookingDto { RoomId = 2 };

        await Assert.ThrowsAsync<ValidationException>(
            () => _service.UpdateBookingAsync(1, 10, dto));
    }

    [Fact]
    public async Task UpdateBooking_BookingNotFound_ThrowsNotFoundException()
    {
        _bookingRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Booking?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.UpdateBookingAsync(1, 999, new UpdateBookingDto()));
    }

    [Fact]
    public async Task UpdateBooking_AnotherUsersBooking_ThrowsValidationException()
    {
        var booking = new Booking { Id = 1, UserId = 5 };
        _bookingRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(booking);

        await Assert.ThrowsAsync<ValidationException>(
            () => _service.UpdateBookingAsync(userId: 99, bookingId: 1, new UpdateBookingDto()));
    }
}