using AutoMapper;
using Moq;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Mapping;
using TravelAgency.BLL.Services;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;
using TravelAgency.Tests.Helpers;
using Xunit;

using BllEnums = TravelAgency.BLL.DTOs.Enums;
using DalEnums = TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.Tests.Services;

public class TourServiceTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IRepository<Tour>> _tourRepoMock;
    private readonly Mock<IRepository<Ticket>> _ticketRepoMock;
    private readonly Mock<IRepository<Booking>> _bookingRepoMock;
    private readonly IMapper _mapper;
    private readonly TourService _service;

    public TourServiceTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _tourRepoMock = new Mock<IRepository<Tour>>();
        _ticketRepoMock = new Mock<IRepository<Ticket>>();
        _bookingRepoMock = new Mock<IRepository<Booking>>();

        _uowMock.Setup(u => u.Tours).Returns(_tourRepoMock.Object);
        _uowMock.Setup(u => u.Tickets).Returns(_ticketRepoMock.Object);
        _uowMock.Setup(u => u.Bookings).Returns(_bookingRepoMock.Object);

        _mapper = MapperHelper.CreateMapper();

        _service = new TourService(_uowMock.Object, _mapper);
    }

    [Fact]
    public async Task CreateTour_ValidData_ReturnsTourDto()
    {
        _tourRepoMock.Setup(r => r.AddAsync(It.IsAny<Tour>())).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new CreateTourDto
        {
            Name = "Тур у Париж",
            Price = 20000,
            City = "Париж",
            Description = "Романтична подорож",
            Date = DateTime.UtcNow.AddDays(30),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<CreateTicketDto>
            {
                new() { Price = 5000, Type = BllEnums.TicketType.Airplane }
            }
        };

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Тур у Париж", result.Name);
        Assert.Equal("Париж", result.City);
        Assert.Equal(20000, result.Price);
    }

    [Fact]
    public async Task CreateTour_WithPromotion_SetsIsHotTrue()
    {
        _tourRepoMock.Setup(r => r.AddAsync(It.IsAny<Tour>())).Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new CreateTourDto
        {
            Name = "Гарячий тур",
            Price = 15000,
            City = "Анталія",
            Description = "Пляж і море",
            Date = DateTime.UtcNow.AddDays(10),
            Type = BllEnums.TourType.Regular,
            Promotion = 3000,
            Tickets = new List<CreateTicketDto> { new() { Price = 4000, Type = BllEnums.TicketType.Airplane } }
        };

        var result = await _service.CreateAsync(dto);

        Assert.True(result.IsHot);
        Assert.Equal(3000, result.Promotion);
    }

    [Fact]
    public async Task CreateTour_EmptyName_ThrowsValidationException()
    {
        var dto = new CreateTourDto
        {
            Name = "",
            Price = 10000,
            City = "Рим",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(5),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<CreateTicketDto> { new() { Price = 1000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateTour_ZeroPrice_ThrowsValidationException()
    {
        var dto = new CreateTourDto
        {
            Name = "Тур",
            Price = 0,
            City = "Рим",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(5),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<CreateTicketDto> { new() { Price = 1000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateTour_PastDate_ThrowsValidationException()
    {
        var dto = new CreateTourDto
        {
            Name = "Минулий тур",
            Price = 5000,
            City = "Варшава",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(-1),
            Type = BllEnums.TourType.Regular,
            Tickets = new List<CreateTicketDto> { new() { Price = 2000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateTour_NoTickets_ThrowsValidationException()
    {
        var dto = new CreateTourDto
        {
            Name = "Тур без квитків",
            Price = 5000,
            City = "Стамбул",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(20),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<CreateTicketDto>()
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateTour_EmptyCity_ThrowsValidationException()
    {
        var dto = new CreateTourDto
        {
            Name = "Тур",
            Price = 5000,
            City = "   ",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(10),
            Type = BllEnums.TourType.Regular,
            Tickets = new List<CreateTicketDto> { new() { Price = 1000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateTour_TicketWithZeroPrice_ThrowsValidationException()
    {
        var dto = new CreateTourDto
        {
            Name = "Тур",
            Price = 5000,
            City = "Дубай",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(10),
            Type = BllEnums.TourType.Regular,
            Tickets = new List<CreateTicketDto> { new() { Price = 0, Type = BllEnums.TicketType.Airplane } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task GetById_TourNotFound_ThrowsNotFoundException()
    {
        _tourRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Tour?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByIdAsync(999));
    }

    [Fact]
    public async Task GetAll_EmptyDatabase_ReturnsEmptyList()
    {
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Tour>());
        _ticketRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Ticket>());

        var result = await _service.GetAllAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetHotTours_ReturnsOnlyHotTours()
    {
        var tours = new List<Tour>
        {
            new() { Id = 1, IsHot = true, Name = "Гарячий", City = "Анталія", Price = 20000 },
            new() { Id = 2, IsHot = false, Name = "Звичайний", City = "Київ", Price = 5000 },
        };
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tours);
        _ticketRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Ticket>());

        var result = (await _service.GetHotToursAsync()).ToList();

        Assert.Single(result);
        Assert.True(result[0].IsHot);
    }

    [Fact]
    public async Task GetHotTours_NoHotTours_ThrowsNotFoundException()
    {
        var tours = new List<Tour>
        {
            new() { Id = 1, IsHot = false, Name = "Звичайний", City = "Київ", Price = 5000 }
        };
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tours);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetHotToursAsync());
    }

    [Fact]
    public async Task GetByType_ReturnsCorrectType()
    {
        var tours = new List<Tour>
        {
            new() { Id = 1, Type = DalEnums.TourType.Regular, Name = "Звичайний", City = "Дубай", Price = 40000 },
            new() { Id = 2, Type = DalEnums.TourType.Excursion, Name = "Екскурсійний", City = "Рим", Price = 20000 },
        };
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tours);
        _ticketRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Ticket>());

        var result = (await _service.GetByTypeAsync(BllEnums.TourType.Regular)).ToList();

        Assert.Single(result);
        Assert.Equal("Звичайний", result[0].Name);
    }

    [Fact]
    public async Task GetByCity_ExistingCity_ReturnsTours()
    {
        var tours = new List<Tour>
        {
            new() { Id = 1, City = "Київ", Name = "Київ 1", Price = 3000 },
            new() { Id = 2, City = "Київ", Name = "Київ 2", Price = 4000 },
            new() { Id = 3, City = "Рим", Name = "Рим 1", Price = 20000 },
        };
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tours);

        var result = (await _service.GetByCityAsync("Київ")).ToList();

        Assert.Equal(2, result.Count);
        Assert.All(result, t => Assert.Equal("Київ", t.City));
    }

    [Fact]
    public async Task GetByCity_CityNotFound_ThrowsNotFoundException()
    {
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Tour>());

        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetByCityAsync("Марс"));
    }

    [Fact]
    public async Task GetByCity_CaseInsensitive_ReturnsTours()
    {
        var tours = new List<Tour>
        {
            new() { Id = 1, City = "Київ", Name = "Тур", Price = 3000 }
        };
        _tourRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tours);

        var result = (await _service.GetByCityAsync("київ")).ToList();

        Assert.Single(result);
    }

    [Fact]
    public async Task Delete_TourWithNoBookings_DeletesSuccessfully()
    {
        var tour = new Tour { Id = 1, Name = "Тур", City = "Київ", Price = 5000 };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Booking>());
        _tourRepoMock.Setup(r => r.Delete(It.IsAny<Tour>()));
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        await _service.DeleteAsync(1);

        _tourRepoMock.Verify(r => r.Delete(tour), Times.Once);
    }

    [Fact]
    public async Task Delete_TourWithActiveBookings_ThrowsValidationException()
    {
        var tour = new Tour { Id = 1, Name = "Тур", City = "Київ", Price = 5000 };
        var bookings = new List<Booking> { new() { Id = 1, TourId = 1, UserId = 5 } };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tour);
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(bookings);

        await Assert.ThrowsAsync<ValidationException>(() => _service.DeleteAsync(1));
    }

    [Fact]
    public async Task Delete_TourNotFound_ThrowsNotFoundException()
    {
        _tourRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Tour?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(999));
    }

    [Fact]
    public async Task Update_ValidData_UpdatesTourSuccessfully()
    {
        var existingTour = new Tour
        {
            Id = 1,
            Name = "Старий тур",
            City = "Рим",
            Price = 10000,
            Type = DalEnums.TourType.Excursion,
            Date = DateTime.UtcNow.AddDays(10)
        };
        var existingTickets = new List<Ticket>
        {
            new() { Id = 1, TourId = 1, Price = 2000, Type = DalEnums.TicketType.Airplane }
        };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingTour);
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Booking>());
        _ticketRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(existingTickets);
        _tourRepoMock.Setup(r => r.Update(It.IsAny<Tour>()));
        _ticketRepoMock.Setup(r => r.Update(It.IsAny<Ticket>()));
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var dto = new UpdateTourDto
        {
            Name = "Оновлений тур",
            Price = 15000,
            City = "Рим",
            Description = "Новий опис",
            Date = DateTime.UtcNow.AddDays(20),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<UpdateTicketDto>
            {
                new() { Id = 1, Price = 3000, Type = BllEnums.TicketType.Airplane }
            }
        };

        var result = await _service.UpdateAsync(1, dto);

        Assert.Equal("Оновлений тур", result.Name);
        Assert.Equal(15000, result.Price);
    }

    [Fact]
    public async Task Update_TourNotFound_ThrowsNotFoundException()
    {
        _tourRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Tour?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.UpdateAsync(999, new UpdateTourDto
            {
                Name = "Test",
                Price = 1000,
                City = "Test",
                Description = "Test",
                Date = DateTime.UtcNow.AddDays(5),
                Type = BllEnums.TourType.Regular,
                Tickets = new List<UpdateTicketDto> { new() { Id = 0, Price = 100, Type = BllEnums.TicketType.Bus } }
            }));
    }

    [Fact]
    public async Task Update_TourWithBookings_ChangingCity_ThrowsValidationException()
    {
        var existingTour = new Tour
        {
            Id = 1,
            Name = "Тур",
            City = "Київ",
            Price = 10000,
            Type = DalEnums.TourType.Regular,
            Date = DateTime.UtcNow.AddDays(10)
        };
        var bookings = new List<Booking> { new() { Id = 1, TourId = 1, UserId = 1 } };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingTour);
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(bookings);

        var dto = new UpdateTourDto
        {
            Name = "Тур",
            Price = 10000,
            City = "Варшава",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(10),
            Type = BllEnums.TourType.Regular,
            Tickets = new List<UpdateTicketDto> { new() { Id = 0, Price = 1000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.UpdateAsync(1, dto));
    }

    [Fact]
    public async Task Update_TourWithBookings_ChangingType_ThrowsValidationException()
    {
        var existingTour = new Tour
        {
            Id = 1,
            Name = "Тур",
            City = "Рим",
            Price = 10000,
            Type = DalEnums.TourType.Regular,
            Date = DateTime.UtcNow.AddDays(10)
        };
        var bookings = new List<Booking> { new() { Id = 1, TourId = 1, UserId = 1 } };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingTour);
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(bookings);

        var dto = new UpdateTourDto
        {
            Name = "Тур",
            Price = 10000,
            City = "Рим",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(10),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<UpdateTicketDto> { new() { Id = 0, Price = 1000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.UpdateAsync(1, dto));
    }

    [Fact]
    public async Task Update_PastDate_ThrowsValidationException()
    {
        var existingTour = new Tour
        {
            Id = 1,
            Name = "Тур",
            City = "Рим",
            Price = 10000,
            Type = DalEnums.TourType.Excursion,
            Date = DateTime.UtcNow.AddDays(10)
        };

        _tourRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingTour);
        _bookingRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Booking>());

        var dto = new UpdateTourDto
        {
            Name = "Тур",
            Price = 10000,
            City = "Рим",
            Description = "Опис",
            Date = DateTime.UtcNow.AddDays(-5),
            Type = BllEnums.TourType.Excursion,
            Tickets = new List<UpdateTicketDto> { new() { Id = 0, Price = 1000, Type = BllEnums.TicketType.Bus } }
        };

        await Assert.ThrowsAsync<ValidationException>(() => _service.UpdateAsync(1, dto));
    }
}