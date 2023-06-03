var amqp = require("amqplib/callback_api");
var { MongoClient } = require('mongodb');

const EventType = {
  Created: 0,
  Updated: 1,
  Deleted: 2
};


var mongoUri = "mongodb://localhost:27017/";
var usersCollection = new MongoClient(mongoUri)
  .db("shippingservicedb").collection("users");


amqp.connect('amqp://45.63.116.153:5672', function (error, connection) {
  if (error)
    throw error;

  connection.createChannel(function (error1, channel) {
    if (error1)
      throw error1;

    var exchange = "usersbus";

    channel.assertExchange(exchange, 'fanout');
    channel.assertQueue('usersbus.shipping', null, function (error2, q) {
      if (error2)
        throw error2;

      channel.bindQueue(q.queue, exchange);

      console.log("Waiting for messages in usersbus.shipping queue");

      channel.consume(q.queue, function (msg) {
        var userEvent = JSON.parse(msg.content.toString());
        console.log("===============================");
        console.log("Received message");
        processUserEvent(userEvent);
        console.log("===============================");
        channel.ack(msg);
      });
    });

  });

  function processUserEvent(userEvent) {
    console.log("Processing User Event")
    console.log(userEvent);

    var userData = {
      _id: userEvent.userData.id,
      name: userEvent.userData.name,
      address: userEvent.userData.address,
    };

    if (userEvent.type == EventType.Created)
      usersCollection.insertOne(userData);
    if (userEvent.type == EventType.Updated)
      usersCollection.updateOne({ '_id': userData._id }, { $set: userData });
    if (userEvent.type == EventType.Deleted)
      usersCollection.deleteOne({ '_id': userData._id });
  }

});