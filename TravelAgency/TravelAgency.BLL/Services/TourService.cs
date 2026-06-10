using AutoMapper;
using TravelAgency.BLL.DTOs;
using TravelAgency.BLL.DTOs.Enums;
using TravelAgency.BLL.Exceptions;
using TravelAgency.BLL.Interfaces;
using TravelAgency.DAL.Entities;
using TravelAgency.DAL.Interfaces;

namespace TravelAgency.BLL.Services
{
    public class TourService : ITourService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TourService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<TourDto> CreateAsync(CreateTourDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ValidationException("Назва туру не може бути пустою.");

            if (dto.Price <= 0)
                throw new ValidationException("Ціна туру повинна бути більше 0.");

            if (string.IsNullOrWhiteSpace(dto.City))
                throw new ValidationException("Місто не може бути пустим.");

            if (dto.Date < DateTime.UtcNow.Date)
                throw new ValidationException("Дата туру не може бути в минулому.");

            var tour = new Tour
            {
                Name = dto.Name,
                Price = dto.Price,
                City = dto.City,
                Description = dto.Description,
                Date = dto.Date,
                Type = (DAL.Entities.Enums.TourType)dto.Type,
                Promotion = dto.Promotion,
                IsHot = dto.Promotion.HasValue && dto.Promotion > 0,
                Tickets = new List<Ticket>()
            };

            foreach (var ticket in dto.Tickets)
            {
                if (ticket.Price <= 0)
                    throw new ValidationException("Ціна квитка повинна бути більше 0.");

                if (string.IsNullOrWhiteSpace(ticket.Type))
                    throw new ValidationException("Тип квитка не може бути пустим.");

                var normalized = ticket.Type.Trim().ToLower();

                if (normalized != "airplane" && normalized != "bus")
                    throw new ValidationException("Тип квитка має бути Airplane або Bus.");

                tour.Tickets.Add(new Ticket
                {
                    Price = ticket.Price,
                    Type = normalized == "airplane" ? "Airplane" : "Bus",
                    Date = dto.Date,
                    Tour = tour
                });
            }

            await _unitOfWork.Tours.AddAsync(tour);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TourDto>(tour);
        }

        public async Task<TourDto> UpdateAsync(int id, UpdateTourDto dto)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(id);

            if (tour == null)
                throw new NotFoundException("Тур не знайдено.");

            // VALIDATION
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ValidationException("Назва туру не може бути пустою.");

            if (dto.Price <= 0)
                throw new ValidationException("Ціна туру повинна бути більше 0.");

            if (string.IsNullOrWhiteSpace(dto.City))
                throw new ValidationException("Місто не може бути пустим.");

            if (dto.Date < DateTime.UtcNow.Date)
                throw new ValidationException("Дата туру не може бути в минулому.");

            if (dto.Tickets == null || dto.Tickets.Count == 0)
                throw new ValidationException("Тур повинен містити хоча б 1 квиток.");

            tour.Name = dto.Name;
            tour.Price = dto.Price;
            tour.City = dto.City;
            tour.Description = dto.Description;
            tour.Date = dto.Date;
            tour.Type = (DAL.Entities.Enums.TourType)dto.Type;
            tour.Promotion = dto.Promotion;
            tour.IsHot = dto.Promotion.HasValue && dto.Promotion > 0;

            var existingTickets = (await _unitOfWork.Tickets.GetAllAsync())
                .Where(t => t.TourId == tour.Id)
                .ToList();

            foreach (var ticketDto in dto.Tickets)
            {
                if (string.IsNullOrWhiteSpace(ticketDto.Type))
                    throw new ValidationException("Тип квитка не може бути пустим.");

                if (ticketDto.Price <= 0)
                    throw new ValidationException("Ціна квитка повинна бути більше 0.");

                var normalizedType = ticketDto.Type.Trim();

                if (normalizedType != "Airplane" && normalizedType != "Bus")
                    throw new ValidationException("Тип квитка має бути Airplane або Bus.");

                if (ticketDto.Id > 0)
                {
                    var ticket = existingTickets.FirstOrDefault(t => t.Id == ticketDto.Id);

                    if (ticket == null)
                        throw new NotFoundException("Квиток не знайдено.");

                    ticket.Price = ticketDto.Price;
                    ticket.Type = normalizedType;
                    ticket.Date = dto.Date;

                    _unitOfWork.Tickets.Update(ticket);
                }
                else
                {
                    var newTicket = new Ticket
                    {
                        Price = ticketDto.Price,
                        Type = normalizedType,
                        Date = dto.Date,
                        TourId = tour.Id
                    };

                    await _unitOfWork.Tickets.AddAsync(newTicket);
                }
            }

            var dtoIds = dto.Tickets
                .Where(t => t.Id > 0)
                .Select(t => t.Id)
                .ToList();

            var ticketsToDelete = existingTickets
                .Where(t => !dtoIds.Contains(t.Id))
                .ToList();

            foreach (var ticket in ticketsToDelete)
            {
                _unitOfWork.Tickets.Delete(ticket);
            }

            _unitOfWork.Tours.Update(tour);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TourDto>(tour);
        }

        public async Task DeleteAsync(int id)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(id);

            if (tour == null)
                throw new NotFoundException("Тур не знайдено.");

            _unitOfWork.Tours.Delete(tour);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<TourDto>> GetAllAsync()
        {
            var tours = await _unitOfWork.Tours.GetAllAsync();
            var tickets = await _unitOfWork.Tickets.GetAllAsync();
            foreach (var tour in tours)
            {
                tour.Tickets = tickets
                    .Where(t => t.TourId == tour.Id)
                    .ToList();
            }
            return _mapper.Map<IEnumerable<TourDto>>(tours);
        }

        public async Task<TourDto> GetByIdAsync(int id)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(id);

            if (tour == null)
                throw new NotFoundException("Тур не знайдено.");

            var tickets = await _unitOfWork.Tickets.GetAllAsync();

            tour.Tickets = tickets
                .Where(t => t.TourId == id)
                .ToList();

            return _mapper.Map<TourDto>(tour);
        }
        public async Task<IEnumerable<TourDto>> GetHotToursAsync()
        {
            var tours = await _unitOfWork.Tours.GetAllAsync();
            var tickets = await _unitOfWork.Tickets.GetAllAsync();

            var hotTours = tours.Where(t => t.IsHot).ToList();

            if (!hotTours.Any())
                throw new NotFoundException("Гарячих турів не знайдено.");

            foreach (var tour in hotTours)
            {
                tour.Tickets = tickets
                    .Where(t => t.TourId == tour.Id)
                    .ToList();
            }

            return _mapper.Map<IEnumerable<TourDto>>(hotTours);
        }
        public async Task<IEnumerable<TourDto>> GetByTypeAsync(TourType type)
        {
            var tours = await _unitOfWork.Tours.GetAllAsync();
            var tickets = await _unitOfWork.Tickets.GetAllAsync();

            var filtered = tours.Where(t => t.Type == (DAL.Entities.Enums.TourType)type);

            foreach (var tour in filtered)
            {
                tour.Tickets = tickets
                    .Where(t => t.TourId == tour.Id)
                    .ToList();
            }

            return _mapper.Map<IEnumerable<TourDto>>(filtered);
        }
        public async Task<IEnumerable<TourDto>> GetByCityAsync(string city)
        {
            var tours = await _unitOfWork.Tours.GetAllAsync();

            var filtered = tours
                .Where(t => t.City.ToLower() == city.ToLower())
                .ToList();

            return _mapper.Map<IEnumerable<TourDto>>(filtered);

        }
    }

}