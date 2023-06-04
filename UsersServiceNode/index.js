const express = require('express');
const app = express();
const port = 3000;
let amqpCB = require("amqplib/callback_api");
let amqp = require("amqplib");
let { MongoClient } = require('mongodb');
//const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

let mongoUri = "mongodb://localhost:27017/";
let userEventsCollection = new MongoClient(mongoUri)
    .db("EDA").collection("userEventsCollection");


let list = [];
let eventType = {};
eventType["Created"] = 0;
eventType["Updated"] = 1;
eventType["Deleted"] = 2;

let user = {
  id: 1,
  name: "Mina",
  email: "mina@gmail.com",
  birthDate: (new Date(2000, 1, 1)).toISOString(),
  address: "string"
}


ReprocessUserEvents()


class UserEvent {
  constructor(id, type) {

    this.Id = id;
    this.Type = type;
    this.CreatedAt = new Date().toISOString();
    this.UserData = user;
  }
}

app.get('/api/users', async (req, res) => {
  let userEvent= new UserEvent(uuidv4(), eventType["Created"])
  await SaveAndProcessEvents(userEvent);
  res.json(userEvent);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const EventType = {
  Created: 0,
  Updated: 1,
  Deleted: 2
};

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

async function SaveAndProcessEvents(userEvent)
{
  await userEventsCollection.insertOne(userEvent);
  ProcessUserEvent(userEvent);
  await sendMessage(userEvent);
}

function ProcessUserEvent(userEvent)
{
  switch (userEvent.Type) {
    case EventType.Created:
      list.push(userEvent.UserData);
      break;
    case EventType.Updated:
      let oldUser = list.find(u => u.Id === userEvent.UserData.Id)[0];
      oldUser.Name = userEvent.UserData.Name;
      oldUser.Email = userEvent.UserData.Email;
      oldUser.BirthDate = userEvent.UserData.BirthDate;
      oldUser.Address = userEvent.UserData.Address;
      break;
    case EventType.Deleted:
      list = list.filter(u => u.Id !== userEvent.UserData.Id);
      break;
  }
}

function ReprocessUserEvents()
{
  //.Find(_ => true).SortBy(e => e.CreatedAt);

  userEventsCollection.find({}).sort('CreatedAt').toArray().then(
      eventsList => {
        for (let userEvent of eventsList) {
          ProcessUserEvent(userEvent);
        }
      }
  );
  list = [];


}

