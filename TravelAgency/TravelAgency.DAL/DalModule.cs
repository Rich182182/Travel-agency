using Autofac;
using TravelAgency.DAL.Interfaces;
using TravelAgency.DAL.Repositories;

namespace TravelAgency.DAL;

public class DalModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.RegisterType<UnitOfWork>().As<IUnitOfWork>().InstancePerLifetimeScope();

        builder.RegisterGeneric(typeof(Repository<>)).As(typeof(IRepository<>)).InstancePerLifetimeScope();
    }
}