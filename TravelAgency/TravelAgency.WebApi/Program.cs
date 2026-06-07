using TravelAgency.BLL;
using TravelAgency.WebApi.Mapping;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddBusinessLogicLayer(connectionString);

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<WebApiBookingProfile>(); 
    cfg.AddProfile<WebApiTourProfile>(); 
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();