const express = require('express');
const app = express();

// This allows the server to read JSON data (orders)
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
  res.send('FraudShield Factory is Online! 🛡️');
});

// The port Render will use to talk to the world
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FraudShield is running on port ${PORT}`);
});