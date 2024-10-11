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

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Product Name
  brand: { type: String, required: true },  // Brand Name
  category: { type: String, required: true },  // Category (e.g., Fashion, Electronics, etc.)
  price: { type: Number, required: true },  // Price of the product
  details: { type: String, required: true },  // Additional product details (e.g., size, material, etc.)
  imageUrl: { type: String, required: true },  // URL of the product image
});

const Product = mongoose.model('Product', productSchema);

//Create a Batches model
const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

const Batch = mongoose.model('Batch', batchSchema);



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

  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    console.log('Decoded token:', decoded);
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
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
  const { currentPassword, newPassword } = req.body;

  try {
    // Find the user by ID from the token
    const user = await User.findById(req.user.userId);

    // Check if the user was found
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate that the email in the token matches the user's email in the database
    if (user.email !== req.user.email) {
      return res.status(403).json({ message: 'Invalid token or mismatched email' });
    }

    // Check if the current password matches the one in the database
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Update the password
    user.password = newPassword; // Set the new password
    await user.save(); // Save the updated user with the new password

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

app.post('/updateprofile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    // Find the user by ID from the token
    const user = await User.findById(req.user.userId);

    // Validate that the email from the token matches the user's email in the database
    if (user.email !== req.user.email) {
      return res.status(403).json({ message: 'Invalid token or mismatched email' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile information
    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.address = req.body.address || user.address;

    // Only update the email if it matches the token's email (optional)
    if (req.body.email && req.body.email === req.user.email) {
      user.email = req.body.email;
    }

    // Update profile picture if a new file is uploaded
    if (req.file) {
      user.profilePicture = req.file.filename;
    }

    // Save the updated user profile
    await user.save();
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

app.get('/joinjastip/me', authenticateToken, async (req, res) => {
  try {
      // Ambil ID pengguna dari token
      const user = await User.findById(req.user.userId); // Find user by ID from the token

      // Check if the user was found
      if (!user) {
          return res.status(404).json({ message: 'User not found' }); // Return 404 if user is not found
      }

      res.status(200).json({
        storeName: user.storeName // Return the storeName from the user object
      }); // Send the storeName to the frontend
  } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


app.get('/sellerinfo', authenticateToken, async (req, res) => {
  try {
    
      const user = await User.findById(req.user.userId);

      if (user) {
          res.json({
              identityCard: user.identityCard,
              storeName: user.storeName,
              storeDescription: user.storeDescription
          });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

// Batch creation endpoint
app.post('/batch', authenticateToken, async (req, res) => {
  const { batchName, startDate, endDate } = req.body;

  if (!batchName || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please fill in all the fields' });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: 'Start date must be before end date' });
  }
  

  try {
      const newBatch = new Batch({
          name: batchName,
          startDate,
          endDate,
          createdBy: req.user.userId, // Use userId from authenticated token
          products: [] // Initialize products array
      });

      await newBatch.save();
      res.status(201).json(newBatch);
  } catch (error) {
      console.error('Error saving batch:', error);
      // Send a more specific error message if available
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Add product to batch endpoint
app.post('/batch/:batchId/product', authenticateToken, async (req, res) => {
  const { batchId } = req.params; // Get the batch ID from the URL
  const { name, price, imageUrl, brand, category, details } = req.body; // Get product details from request body

  try {
    // Find the batch by ID
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (!name || !price || !imageUrl || !brand || !category || !details) {
      return res.status(400).json({ message: 'Please fill in all the fields' });
    }
    

    // Create a new product object
    const newProduct = {
      name,
      price,
      imageUrl,
      brand,
      category,
      details,
    };

    // Push the new product to the batch's products array
    batch.products.push(newProduct);

    // Save the updated batch
    await batch.save();

    res.status(200).json(batch); // Respond with the updated batch
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get batches and their products for the authenticated user
app.get('/batches/products', authenticateToken, async (req, res) => {
  try {
    // Fetch batches created by the user, including products in each batch
    const batches = await Batch.find({ createdBy: req.user.userId });

    // Check if batches are found
    if (!batches || batches.length === 0) {
      return res.status(404).json({ message: 'No batches found for this user' });
    }

    res.status(200).json(batches); // Return batches with products
  } catch (error) {
    console.error('Error fetching batches and products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get products for a specific batch
app.get('/batches/:batchId/products', authenticateToken, async (req, res) => {
  const { batchId } = req.params;
  
  try {
    // Fetch the batch by ID and include the products
    const batch = await Batch.findById(batchId);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(batch.products); // Return only products
  } catch (error) {
    console.error('Error fetching products for batch:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
