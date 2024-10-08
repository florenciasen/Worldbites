// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');


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
  password: { type: String, required: true },
  resetOtp: { type: String },
  otpExpires: { type: Date },
});

const User = mongoose.model('User', userSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
  const { email, phoneNumber, password } = req.body;

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Create a new user
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

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne
      ({ email, password });
    if (user) {
      res.status(200).send('Login successful!');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Server error');
  }
});


app.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate an OTP
    const otp = crypto.randomInt(1000, 9999).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Read the HTML template
    const templatePath = path.join(__dirname, 'emailTemplates', 'passwordResetEmail.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace the placeholder with the actual OTP
    htmlContent = htmlContent.replace('{{otp}}', otp);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'worldbitess@gmail.com',
        pass: 'lpsq qoda rkjs rhhq',
      },
    });

    const mailOptions = {
      from: 'worldbitess@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({
      message: 'OTP sent to email',
      email, // Pass the email back to use on the OTP page
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Server error');
  }
});

// Resend OTP endpoint
app.post('/resendotp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate a new OTP
    const otp = crypto.randomInt(1000, 9999).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

     // Read the HTML template
     const templatePath = path.join(__dirname, 'emailTemplates', 'passwordResetEmail.html');
     let htmlContent = fs.readFileSync(templatePath, 'utf8');
 
     // Replace the placeholder with the actual OTP
     htmlContent = htmlContent.replace('{{otp}}', otp);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'worldbitess@gmail.com',
        pass: 'lpsq qoda rkjs rhhq',
      },
    })

    const mailOptions = {
      from: 'worldbitess@gmail.com',
      to: email,
      subject: 'Resend Password Reset OTP',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({
      success: true,
      message: 'OTP resent to email',
      email, // Pass the email back to use on the OTP page
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).send('Server error');
  }
});

// OTP Verification endpoint
app.post('/verifyotp', async (req, res) => {
  const { email, otp } = req.body;

  try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).send({
              success: false,
              message: 'User not found'
          });
      }

      // Check if the OTP is correct and not expired
      const isOtpValid = user.resetOtp === otp;
      const isOtpExpired = Date.now() > user.otpExpires;

      if (!isOtpValid) {
          return res.status(400).send({
              success: false,
              message: 'Invalid OTP'
          });
      }

      if (isOtpExpired) {
          return res.status(400).send({
              success: false,
              message: 'OTP has expired'
          });
      }

      // OTP is valid and not expired; proceed with your logic (e.g., allow password reset)
      res.status(200).send({
          success: true,
          message: 'OTP verified successfully!'
      });

      // Optionally, clear the OTP and expiration time after successful verification
      user.resetOtp = undefined;
      user.otpExpires = undefined;
      await user.save();

  } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).send({
          success: false,
          message: 'Server error'
      });
  }
});

app.post('/resetpassword', async (req, res) => {
  console.log(req.body); // Log the request body to see what's being sent
  const { email, newPassword } = req.body;

  try {
      // Validate input
      if (!email || !newPassword) {
          return res.status(400).json({ success: false, message: 'Email and new password are required.' });
      }

      // Find user by email
      const user = await User.findOne({ email: email });
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Update the user's password without hashing
      user.password = newPassword;

      // Save the updated user
      await user.save();

      // Send success response
      res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
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
