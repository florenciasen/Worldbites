// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');


// JWT secret key
const JWT_SECRET = 'worldbitesthebest';


// Create an Express app
const app = express();
const port = 3011;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000' // Replace with your React app's URL
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/worldbites'; // Update with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create a User model
const userSchema = new mongoose.Schema({
  name: { type: String, default: null }, // Name can be null initially
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, default: null }, // Address can be null initially
  profilePicture: { type: String, default: null }, // Store the URL or filename of the profile picture
  resetOtp: { type: String },
  otpExpires: { type: Date },
  storeName: { type: String, default: null },
  identityCard: { type: String, default: null },
  storeDescription: { type: String, default: null },

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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer TOKEN" format

  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {  // Use the hardcoded JWT secret here as well
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;  // Attach decoded user data (userId, email, phoneNumber) to request object
    next();
  });
};


// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email and password
    const user = await User.findOne({ email, password });

    if (user) {
      // User found, generate JWT token with user id, email, and phoneNumber
      const token = jwt.sign(
        {
          userId: user._id,         // Include user ID in the token
          email: user.email,        // Include user email in the token
          phoneNumber: user.phoneNumber  // Include user phoneNumber in the token
        },
        JWT_SECRET,                 // Use the hardcoded secret key for signing
        { expiresIn: '1h' }         // Token expiration time (e.g., 1 hour)
      );

      // Return the token to the client
      return res.status(200).json({ message: 'Login successful!', token });
    } else {
      // Invalid credentials
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint for invalidating token
app.post('/logout', authenticateToken, (req, res) => {
  // Add the token to a blacklist (or handle refresh token invalidation)

  // Example: If you're using refresh tokens, invalidate the refresh token here

  if (req.user) {
    res.status(200).json({ message: 'Logout successful' });
  } else {
    res.status(401).json({ message: 'Invalid token' });
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
    user.otpExpires = Date.now() + 600000; // 10 minutes expiration
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
    user.otpExpires = Date.now() + 600000; // 10 minutes expiration
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


// Change Password Endpoint
app.post('/changepassword', authenticateToken, async (req, res) => {
  console.log('User from token:', req.user); // Log the user object for debugging

  const { currentPassword, newPassword } = req.body;

  try {
      // Find user in the database
      const user = await User.findById(req.user.userId); // Find user by ID from token

      // Check if the user was found
      if (!user) {
          return res.status(404).json({ message: 'User not found.' }); // Return error if user not found
      }

      // Check if the current password matches
      if (user.password !== currentPassword) {
          return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      // Update the password
      user.password = newPassword; // Set the new password
      await user.save(); // Save the user

      res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Internal server error.' });
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

// Endpoint to get user data
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send only the necessary user data
    res.status(200).json({
      name: user.name || null,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address || null,
      profilePicture: user.profilePicture ? `http://localhost:3011/uploads/${user.profilePicture}` : null, // Include the URL to the profile picture
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Endpoint to get the user's profile picture
app.get('/profile-picture', authenticateToken, async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build the URL for the profile picture
    const profilePictureUrl = user.profilePicture ? `http://localhost:3011/uploads/${user.profilePicture}` : null;

    // Send the profile picture URL as response
    res.status(200).json({ profilePicture: profilePictureUrl });
  } catch (error) {
    console.error('Error getting profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Specify the storage directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique filename
    const fileName = uniqueSuffix + '-' + file.originalname; // Create the complete filename
    cb(null, fileName); // Use only the generated filename (e.g., 1728470295679-948396911-STNK.jpeg)
  },
});


const upload = multer({ storage });

// Update profile endpoint
app.post('/updateprofile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's profile information
    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phone || user.phoneNumber;
    user.email = req.body.email || user.email;
    user.address = req.body.address || user.address;

    // If a new profile picture is uploaded, update it; otherwise, keep the existing one
    if (req.file) {
      user.profilePicture = req.file.filename; // Save just the filename
    }

    await user.save(); // Save the updated user information
    res.status(200).json({ message: 'Profile updated successfully', profile: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/joinjastip', authenticateToken, async (req, res) => {
  const { storeName, identityCard, storeDescription } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's store information
    user.storeName = storeName || user.storeName;
    user.identityCard = identityCard || user.identityCard;
    user.storeDescription = storeDescription || user.storeDescription

    await user.save(); // Save the updated user information
    res.status(200).json({ message: 'Jastip store information updated successfully', profile: user });
  } catch (error) {
    console.error('Error updating jastip store information:', error);
    res.status(500).json({ message: 'Server error' });
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
