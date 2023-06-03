using Microsoft.EntityFrameworkCore;
using UsersService.Data;
using UsersService.RabbitMq;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<IUserRepository, UserRepository>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDBContext>(
    options => options.UseSqlServer("Server=.;Database=UsersServiceDB;Trusted_Connection=True;Encrypt=False;"), ServiceLifetime.Singleton);

var app = builder.Build();


RMQSubscriber.ListenToMQ();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();



app.Run();
