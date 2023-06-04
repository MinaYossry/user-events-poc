using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System.Text.Json;
using UsersService.Data;
using System.Diagnostics;

namespace UsersService.RabbitMq
{
    public class RMQSubscriber
    {
        public static void ListenToMQ()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "45.63.116.153", // Replace with the RabbitMQ server hostname or IP address
                UserName = "guest",     // Replace with the RabbitMQ username
                Password = "guest",
                Port = 5672         // Replace with the RabbitMQ password

            };

            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                var queueName = "MinaEX.Task2Demo"; // Replace with the name of the queue you want to consume from

                channel.QueueDeclare(queue: queueName,
                                     durable: true,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);

                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += (sender, ea) =>
                {
                    var message = System.Text.Encoding.UTF8.GetString(ea.Body.ToArray());
                    var user = JsonSerializer.Deserialize<UserEvent>(message, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    });
                    Debug.WriteLine(user?.Id);
                    Console.WriteLine("Received message: {0}", message);
                };

                channel.BasicConsume(queue: queueName,
                                     autoAck: true,
                                     consumer: consumer);

                Console.WriteLine("Waiting for messages...");
                Console.ReadLine();
            }
        }
    }
}
