require("dotenv").config();
const express = require('express');
const { createClient } = require('redis');

main();

async function main() {
  try {
    const app = express();
    const port = 3000;
    
    // connect to redis
    const client = createClient({ url: process.env.REDIS_URL });

    client.on('connect', () => console.log('Redis Client Connected'));
    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    app.get('/', (req, res) => {
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
