require("dotenv").config();
const express = require('express');
const { createClient } = require('redis');

main();

async function main() {
  try {
    // instantiate express
    const app = express();

    // set port to listen on
    const port = 3000;
    
    // instantiate redis client
    const client = createClient({ url: process.env.REDIS_URL });

    // redis events
    client.on('connect', () => console.log('Redis Client Connected'));
    client.on('error', (err) => console.log('Redis Client Error', err));

    // connect to redis
    await client.connect();

    /* Widget Crud */
    
    // New Widget
    app.post('/widgets', (req, res) => {
      res.send('Hello World!');
    });

    // Get Widget By ID
    app.get('/widgets/:widgetId', (req, res) => {
      res.send('Hello World!');
    });

    // Update Widget By ID
    app.put('/widgets/:widgetId', (req, res) => {
      res.send('Hello World!');
    });

    // Delete Widget By ID
    app.delete('/widgets/:widgetId', (req, res) => {
      res.send('Hello World!');
    });

    // Get All Widgets
    app.get('/widgets', (req, res) => {
      res.send('Hello World!');
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
