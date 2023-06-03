using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace UsersService.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDBContext context;
        private readonly IModel rabbitmqModel;

        public UserRepository(ApplicationDBContext context)
        {
            this.context = context;

            var factory = new ConnectionFactory();

            factory.UserName = "guest";
            factory.Password = "guest";
            factory.HostName = "45.63.116.153";
            factory.Port = 5672;

            var connection = factory.CreateConnection();

            rabbitmqModel = connection.CreateModel();
            rabbitmqModel.ExchangeDeclare("usersbus", ExchangeType.Fanout, true);

        }
        public async Task<User> Add(User user)
        {
            context.Add<User>(user);
            await context.SaveChangesAsync();

            //var userEvent = new UserEvent
            //{
            //    Type = EventType.Created,
            //    UserData = user,
            //};
            //PublishEvent(userEvent);
            return user;
        }

        public async Task Delete(int id)
        {

            var userToDelete = await context.Users.FindAsync(id);
            if (userToDelete == null)
                throw new Exception("User not found");

            context.Users.Remove(userToDelete);
            await context.SaveChangesAsync();

            var userEvent = new UserEvent
            {
                Type = EventType.Deleted,
                UserData = userToDelete,
            };
            PublishEvent(userEvent);
        }

        public async Task<List<User>> GetAll()
        {
            return await context.Users.ToListAsync();
        }

        public async Task<User> Update(User user)
        {
            var userToUpdate = await context.Users.FindAsync(user.Id);
            if (userToUpdate == null)
                throw new Exception("User not found");

            userToUpdate.Name = user.Name;
            userToUpdate.Email = user.Email;
            userToUpdate.BirthDate = user.BirthDate;
            userToUpdate.Address = user.Address;

            await context.SaveChangesAsync();

            var userEvent = new UserEvent
            {
                Type = EventType.Updated,
                UserData = userToUpdate,
            };
            PublishEvent(userEvent);

            return userToUpdate;
        }

        private void PublishEvent(UserEvent userEvent) 
        {
            var jsonEvent = JsonSerializer.Serialize(userEvent, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });
            var body = Encoding.UTF8.GetBytes(jsonEvent);

            rabbitmqModel.BasicPublish("usersbus", "", null, body);
        }
    }
}
