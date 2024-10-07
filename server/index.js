// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package

// Create an Express app
const app = express();
const port = 3011;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.use(cors()); // Enable CORS for all routes

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/worldbites'; // Update with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create a User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
  const { email, phoneNumber, password } = req.body;

  try {
    const newUser = new User({
      email,
      phoneNumber,
      password
    });

    // Save user to the database
    await newUser.save();
    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Server error');
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
