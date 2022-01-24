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

    // default redis record expiration (seconds)
    const redisExpire = 60 * 5;

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
        let value = req.body.value;

        // add a unique id to the record
        const id = uuid.v4();
        value.id = id;

        // stringify value
        let valStr = JSON.stringify(value);
        
        // save key/value pair to redis
        await client.set(id, valStr, { EX: redisExpire });

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
    app.put('/widgets/:widgetId', async (req, res) => {
      try {
        // get values from request body
        let value = req.body.value;

        // get id from path
        const id = req.params.widgetId;

        // stringify value
        let valStr = JSON.stringify(value);

        // save key/value pair to redis
        await client.set(id, valStr, { EX: redisExpire });

        res.setHeader("location", "/widgets/" + id);
        res.status(200).json(value);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Delete Widget By ID
    app.delete('/widgets/:widgetId', async (req, res) => {
      try {
        // get id from path
        const id = req.params.widgetId;

        // delete record by id from redis
        await client.del(id);

        // respond success with 204
        res.status(204).json();
      } catch (err) {
        // respond failure with 500
        res.status(500).json({ error: err.message });
      }
    });

    // Get All Widgets
    app.get('/widgets', async (req, res) => {
      try {
        const widgets = [];
        const keys = await client.keys("*");
        for (const key of keys) {
          const valStr = await client.get(key);
          const val = JSON.parse(valStr);
          widgets.push(val);
        }
        res.json(widgets);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
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
