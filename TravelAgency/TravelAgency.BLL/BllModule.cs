using Autofac;
using TravelAgency.BLL.Interfaces;
using TravelAgency.BLL.Services;
using TravelAgency.DAL;
namespace TravelAgency.BLL;

public class BllModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.RegisterModule(new DalModule());

        builder.RegisterType<BookingService>().As<IBookingService>().InstancePerLifetimeScope();
        builder.RegisterType<AuthService>().As<IAuthService>().InstancePerLifetimeScope();
        builder.RegisterType<UserService>().As<IUserService>().InstancePerLifetimeScope();
        builder.RegisterType<TourService>().As<ITourService>().InstancePerLifetimeScope();
        builder.RegisterType<FavoriteService>().As<IFavoriteService>().InstancePerLifetimeScope();
        builder.RegisterType<HotelService>().As<IHotelService>().InstancePerLifetimeScope();
        builder.RegisterType<RoomService>().As<IRoomService>().InstancePerLifetimeScope();
        builder.RegisterType<DbInitializationService>().As<IDbInitializationService>().InstancePerLifetimeScope();
    }
}