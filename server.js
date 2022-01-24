require("dotenv").config();
const express = require('express');
const { createClient } = require('redis');
const uuid = require('uuid');

main();

async function main() {
  try {
    // instantiate express
    const app = express();

    // accept json request body
    app.use(express.json());

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
    app.post('/widgets', async (req, res) => {
      try {
        // get values from request body
        let value = req.body.value; // object

        // add a unique id to the record
        const id = uuid.v4();
        value.id = id;

        // stringify value
        let valStr = JSON.stringify(value);
        
        // save key/value pair to redis
        const saveRes = await client.set(id, valStr, { EX: 30 });

        res.setHeader("location", "/widgets/" + id);
        res.status(201).json();
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Get Widget By ID
    app.get('/widgets/:widgetId', async (req, res) => {
      try {
        // get id from path
        const id = req.params.widgetId;
        
        // retrieve record by id
        const val = await client.get(id);
        console.log("returned from redis: ", val);

        if(!val) {
          // if no value is returned
          res.status(404).json({ error: "Value was not found in Redis."});
        } else {
          // if value is returned
          // turn record from string back to object
          const valueObj = JSON.parse(val);
          
          res.json(valueObj);
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
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

    // Listen for connections on port
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
