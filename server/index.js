// server/server.js
const express = require('express');
const app = express();
const port = 3011;

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
