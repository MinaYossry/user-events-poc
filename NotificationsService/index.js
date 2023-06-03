const express = require('express');
const app = express();
const port = 3000;
var amqpCB = require("amqplib/callback_api");
var amqp = require("amqplib");
var { MongoClient } = require('mongodb');



app.get('/api/users', (req, res) => {
  // Logic to fetch users from a database or any other source
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];
  // public int Id { get; set; }
  // public string Name { get; set; }
  // public string Email { get; set; }
  // public DateTime BirthDate { get; set; }
  // public string Address { get; set; }

  let user = {
    id: 1,
    name: "Mina",
    email: "mina@gmail.com",
    birthDate: (new Date(2000, 1, 1)).toISOString(),
    address: "string"
  }

  sendMessage(user);
  res.json(users);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const EventType = {
  Created: 0,
  Updated: 1,
  Deleted: 2
};

var mongoUri = "mongodb://localhost:27017/";
var usersCollection = new MongoClient(mongoUri)
  .db("notificationservicedb").collection("users");


// amqpCB.connect('amqp://45.63.116.153:5672', function (error, connection) {
//   if (error)
//     throw error;

//   connection.createChannel(function (error1, channel) {
//     if (error1)
//       throw error1;

//     var exchange = "MinaEX";

//     channel.assertExchange(exchange, 'fanout');
//     channel.assertQueue('MinaEX.Task2Demo', null, function (error2, q) {
//       if (error2)
//         throw error2;

//       channel.bindQueue(q.queue, exchange);

//       console.log("Waiting for messages in MinaEX.Task2Demo queue");

//       channel.consume(q.queue, function (msg) {
//         var userEvent = JSON.parse(msg.content.toString());
//         console.log("===============================");
//         console.log("Received message");
//         console.log(userEvent);
//         console.log("===============================");
//         channel.ack(msg);
//       });
//     });

//   });

//   function processUserEvent(userEvent) {
//     console.log("Processing User Event")
//     console.log(userEvent);

//     var userData = {
//       _id: userEvent.userData.id,
//       name: userEvent.userData.name,
//       email: userEvent.userData.email,
//     };

//     if (userEvent.type == EventType.Created)
//       usersCollection.insertOne(userData);
//     if (userEvent.type == EventType.Updated)
//       usersCollection.updateOne({ '_id': userData._id }, { $set: userData });
//     if (userEvent.type == EventType.Deleted)
//       usersCollection.deleteOne({ '_id': userData._id });
//   }

// });



async function sendMessage(user) {
  try {
    // Create a connection to RabbitMQ
    const connectionUrl = 'amqp://guest:guest@45.63.116.153:5672';

    // Create a connection to RabbitMQ
    const connection = await amqp.connect(connectionUrl);

    // Create a channel
    const channel = await connection.createChannel();

    // Define the exchange name and type
    const exchange = 'MinaEX';
    const exchangeType = 'fanout';

    // Assert the exchange
    await channel.assertExchange(exchange, exchangeType, { durable: true });

    // Convert the object to JSON string
    const jsonString = JSON.stringify(user);

    const routingKey = 'myRoutingKey';

    // Publish the message to the exchange with the routing key
    channel.publish(exchange, routingKey, Buffer.from(jsonString));

    console.log('Message sent successfully');

    // Close the channel and the connection
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}


