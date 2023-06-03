const express = require('express');
const app = express();
const port = 3000;
var amqpCB = require("amqplib/callback_api");
var amqp = require("amqplib");
var { MongoClient } = require('mongodb');



app.get('/api/users', (req, res) => {
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


