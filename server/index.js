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
const Fuse = require('fuse.js');
const axios = require('axios');


// JWT secret key
const JWT_SECRET = 'worldbitesthebest';


// Create an Express app
const app = express();
const port = 3011;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/worldbites'; // Update with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


  const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who made the order
    store: { type: String, required: true }, // Store name
    storePicture: { type: String, required: true }, // Store picture URL
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true }
    }],
    totalItems: { type: Number, required: true }, // Total number of items
    totalPrice: { type: Number, required: true }, // Total price of the order
    shippingby: { type: String, required: true }, // Shipping method
    trackingNumber: { type: String, default: 'xxxxxxx' }, // Tracking number for the order
    status: { type: String, default: 'On Progress' }, // Order status
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);


const cartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    details: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: { type: Number, default: 1 },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    isChecked: { type: Boolean, required: true }
  });
  
  const Cart = mongoose.model('Cart', cartSchema);
  
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
  storePicture: { type: String, default: null },
  JastipFrom: { type: String, default: null },
  ShippingMethod: { type: String, default: null },
  cartId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }]
});

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Product Name
  brand: { type: String, required: true },  // Brand Name
  category: { type: String, required: true },  // Category (e.g., Fashion, Electronics, etc.)
  price: { type: Number, required: true },  // Price of the product
  details: { type: String, required: true },  // Additional product details (e.g., size, material, etc.)
  imageUrl: { type: String, required: true },  // URL of the product image
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Reference to the user who created the product
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

  try {
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

app.get('/usercheckout', authenticateToken, async (req, res) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find only the cart items where isChecked is true
    const checkedCartItems = await Cart.find({ createdBy: req.user.userId, isChecked: true });

    // Respond with both user data and the checked cart items
    res.json({
      name: user.name,
      phone: user.phoneNumber,
      email: user.email,
      address: user.address,
      cartItems: checkedCartItems,  // Send only checked items
    });
  } catch (error) {
    console.error('Error fetching user data and checked cart items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/filter', async (req, res) => {
  const { selectedCategories, selectedBrands } = req.body;

  let filter = {};

  // Build the filter object dynamically based on the selected filters
  if (selectedCategories.length > 0) {
      filter.category = { $in: selectedCategories }; // Find products that match the selected categories
  }

  if (selectedBrands.length > 0) {
      filter.brand = { $in: selectedBrands }; // Find products that match the selected brands
  }

  try {
      // Fetch products based on the selected filters
      const products = await Product.find(filter);
      res.json(products);
  } catch (error) {
      console.error('Error fetching filtered products:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


app.post('/search', async (req, res) => {
  const { query } = req.body;

  try {
      // Fetch all products from the database (can be optimized by fetching specific fields)
      const products = await Product.find({});

      // Define options for Fuse.js to perform fuzzy search
      const options = {
          keys: ['name'], // Search by the 'name' field
          threshold: 0.4, // This controls how fuzzy the search is (lower is stricter, higher is more fuzzy)
      };

      // Initialize Fuse with the products list and options
      const fuse = new Fuse(products, options);

      // Perform the fuzzy search
      const result = fuse.search(query);

      // Extract the actual products from the Fuse.js result
      const filteredProducts = result.map(res => res.item);

      // Sort the filtered products alphabetically
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

      res.json(filteredProducts);
  } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Server error' });
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
    user.email = req.body.email || user.email;
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
        storeJastipFrom: user.JastipFrom,
        storeDescription: user.storeDescription,
        storePicture: user.storePicture,
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
app.post('/batch/add-product', authenticateToken, upload.single('imageUrl'), async (req, res) => {
  try {

    const { productName, price, brand, category, details, batchId } = req.body;

    // Find the batch by ID
    const batch = await Batch.findById(batchId);


    console.log('Batch:', batch);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Create a new product
    const newProduct = new Product({
      name: productName,
      price,
      brand,
      category,
      details,
      imageUrl: req.file ? req.file.filename : null, // Save the filename if a file is uploaded
      createdBy: req.user.userId // Use userId from authenticated token
    });

    // Save the product to the Product collection
    const savedProduct = await newProduct.save();

    // Add the saved product's ID to the batch's products array
    batch.products.push(savedProduct._id);

    // Save the updated batch
    await batch.save();

    res.status(200).json({ message: 'Product added to batch', batch });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all products in a batch
app.get('/batches/products', authenticateToken, async (req, res) => {
  try {
    // Fetch batches created by the user, including populated products
    const batches = await Batch.find({ createdBy: req.user.userId }).populate('products');

    // Check if batches are found
    if (!batches || batches.length === 0) {
      return res.status(404).json({ message: 'No batches found for this user' });
    }

    res.status(200).json(batches); // Return batches with populated products
  } catch (error) {
    console.error('Error fetching batches and products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/getproductdescription/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from the URL

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/deleteproductdescription/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from the URL

    // Find the product by ID and remove it
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/updateproductdescription/:id', authenticateToken, upload.single('productimage'), async (req, res) => {
  const { name, price, brand, category, details } = req.body;
  const imageUrl = req.file ? req.file.filename : undefined; // Get filename from multer

  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      name,
      price,
      brand,
      category,
      details,
      ...(imageUrl && { imageUrl }) // Only update imageUrl if a new image is uploaded
    }, { new: true });

    if (!updatedProduct) return res.status(404).send('Product not found');
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Server error');
  }
});


app.get('/getallproducts', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the collection
    res.status(200).json(products); // Send the products as a JSON response
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});


// Endpoint to get product and associated user/store data
// Endpoint to get product and associated user/store data
app.get('/productinfo/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get productId from URL params

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the batch that contains the product
    const batch = await Batch.findOne({ products: product._id });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Find the user who created the batch (createdBy)
    const user = await User.findById(batch.createdBy);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create response data
    const responseData = {
      product: {
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        details: product.details,
        imageUrl: product.imageUrl
      },
      store: {
        name: user.storeName,
        profilePicture: user.profilePicture,
      },
      batch: {
        startDate: batch.startDate,
        endDate: batch.endDate,
        createdBy: batch.createdBy
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/cart/add', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;

  console.log('Product ID:', productId);
  console.log('Quantity:', quantity);

  try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).send('Product not found');

      // Check if the product already exists in the user's cart
      const existingCartItem = await Cart.findOne({
          createdBy: req.user.userId, // Correctly reference user ID
          productId: productId // Make sure this field exists in your Cart schema
      });

      if (existingCartItem) {
          // If it exists, update the quantity
          existingCartItem.quantity += quantity; // Increment the quantity
          await existingCartItem.save(); // Save the updated cart item
          return res.status(200).json(existingCartItem); // Respond with updated item
      }

      // Create a new cart item if it doesn't exist
      const cart = new Cart({
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          details: product.details,
          imageUrl: product.imageUrl,
          createdBy: req.user.userId,
          quantity: quantity, // Set initial quantity
          productId: productId, // Ensure productId is included in the Cart schema
          isChecked: true
      });

      await cart.save();
      await User.findByIdAndUpdate(req.user.userId, { $push: { cartId: cart._id } });

      res.status(201).json(cart); // Respond with the new cart item
  } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// In your Express server
app.get('/getcart', authenticateToken, async (req, res) => {
  try {
      const cartItems = await Cart.find({ createdBy: req.user.userId });
      res.status(200).json(cartItems);
  } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
});


app.delete('/cart/remove/:id', authenticateToken, async (req, res) => {
  try {
      const { id } = req.params;

      // Remove the item from the Cart collection
      const result = await Cart.findByIdAndDelete(id);
      
      if (!result) return res.status(404).json({ message: 'Item not found' });
      
      res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ message: 'Error removing item from cart' });
  }
});


app.put('/updatecartquantity/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;


  try {
      // Update the quantity in the database
      const updatedItem = await Cart.findByIdAndUpdate(id, { quantity }, { new: true });
      
      if (!updatedItem) {
          console.error(`Item with ID: ${id} not found.`);
          return res.status(404).json({ message: 'Item not found' });
      }

      res.json(updatedItem);
  } catch (error) {
      console.error('Error updating quantity:', error);
      res.status(500).json({ message: 'Failed to update quantity', error: error.message });
  }
});

app.put('/cart/updateIsChecked/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;  // Cart item ID from the URL
  const { isChecked } = req.body;  // The new isChecked value sent in the request body

  try {
    // Update the isChecked status in the database
    const updatedItem = await Cart.findByIdAndUpdate(id, { isChecked }, { new: true });
    
    if (!updatedItem) {
      console.error(`Item with ID: ${id} not found.`);
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(updatedItem);  // Return the updated item
  } catch (error) {
    console.error('Error updating isChecked status:', error);
    res.status(500).json({ message: 'Failed to update isChecked status', error: error.message });
  }
});



app.get('/get-store-profile', authenticateToken, async (req, res) => {

  try {
  
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store profile', error: error.message });
  }
});


app.post('/update-store-profile', authenticateToken, upload.single('storePicture'), async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('File:', req.file);

    const user = await User.findById(req.user.userId);

    console.log('User:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.storeName = req.body.storeName || user.storeName;
    user.storeDescription = req.body.storeDescription || user.storeDescription;
    user.JastipFrom = req.body.JastipFrom || user.JastipFrom;
    user.ShippingMethod = req.body.ShippingMethod || user.ShippingMethod;

    if (req.file) {
      user.storePicture = req.file.filename;
    }

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating store profile:', error);
    res.status(500).json({ message: 'Error updating store profile', error: error.message });
  }
});



app.get('/provinces', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.rajaongkir.com/starter/province', {
      headers: { key: '687ec21839595a49d2e828450438be1c' }
    });
    res.json(response.data.rajaongkir.results);
  } catch (error) {
    console.error('Error fetching provinces:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch provinces' });
  }
});


// Get cities by province ID
app.get('/cities/:provinceId', authenticateToken, async (req, res) => {
  const { provinceId } = req.params;

  try {
    const response = await axios.get('https://api.rajaongkir.com/starter/city', {
      params: { province: provinceId },
      headers: {
        key: '687ec21839595a49d2e828450438be1c'
      }
    });
    res.json(response.data.rajaongkir.results);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Calculate shipping cost (ongkir)
app.post('/ongkir', authenticateToken, async (req, res) => {
  const { origin, destination, weight, courier } = req.body; // Expecting these fields from the client

  try {
    const response = await axios.post('https://api.rajaongkir.com/starter/cost', {
      origin: origin, // Example: origin city ID
      destination, // Example: destination city ID
      weight, // Example: 1000 (in grams)
      courier // Example: 'jne', 'pos', 'tiki'
    }, {
      headers: { 
        key: '687ec21839595a49d2e828450438be1c'
      }
    });

    res.json(response.data.rajaongkir.results);
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    res.status(500).json({ error: 'Failed to calculate shipping cost' });
  }
});


app.post('/buy-now', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;

  console.log('Buy Now - Product ID:', productId);
  console.log('Quantity:', quantity);

  try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).send('Product not found');

      // You don't save the product to the cart for "Buy Now".
      // Instead, directly return the product details with the specified quantity.
      
      const checkoutProduct = {
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          details: product.details,
          imageUrl: product.imageUrl,
          quantity: quantity, // Set quantity for immediate checkout
          productId: productId,
      };

      // Send the product details for the checkout process without saving them
      return res.status(200).json({
          success: true,
          message: 'Proceed to checkout',
          product: checkoutProduct // Return the product details
      });
  } catch (error) {
      console.error('Error during Buy Now:', error);
      res.status(500).json({ message: 'Error processing Buy Now', error: error.message });
  }
});

app.post('/checkout', authenticateToken, async (req, res) => {
  try {
      // Get buyer's user ID from the token
      const buyerId = req.user.userId;

      // Extract products, totalItems, totalPrice, and courier from the request body
      const { products, totalItems, totalPrice, courier } = req.body;

      if (!courier) {
          return res.status(400).json({ message: 'Please select a shipping courier' });
      }

      // Fetch product details with their 'createdBy' field populated to get seller info
      const productIds = products.map(p => p.productId);
      const productDetails = await Product.find({ _id: { $in: productIds } }).populate('createdBy'); // Populate seller details

      if (!productDetails.length) {
          return res.status(404).json({ message: 'Products not found' });
      }

      // Now fetch the store details from the 'createdBy' (seller's user) for each product
      const firstProductSeller = productDetails[0].createdBy; // Assume all products come from the same seller

      // Get the seller's store name and picture from the seller's (createdBy) user profile
      const storeName = firstProductSeller.storeName || 'Default Store Name';  // Seller's store name
      const storePicture = firstProductSeller.storePicture || 'default-store-pic.jpg';  // Seller's store picture

      // Create a new order for the buyer, but with the seller's store details
      const newOrder = new Order({
          user: buyerId,  // Buyer's user ID
          store: storeName,  // Seller's store name
          storePicture: storePicture,  // Seller's store picture
          products: products,  // Products being ordered
          totalItems: totalItems,  // Total number of items
          totalPrice: totalPrice,  // Total price
          shippingby: courier,  // Shipping method selected
          trackingNumber: "xxxxxxx",  // Default tracking number
          status: "On Progress"  // Default order status
      });

      // Save the new order
      await newOrder.save();

      res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});



app.get('/orders', authenticateToken, async (req, res) => {
  try {
      // Get the authenticated user's ID
      const userId = req.user.userId;

      // Fetch orders related to this user
      const orders = await Order.find({ user: userId });

      res.status(200).json({ orders });
  } catch (error) {
      console.error('Error fetching orders:', error.message);
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.get('/orders-history', authenticateToken, async (req, res) => {
  try {
      const userId = req.user.userId;

      // Fetch orders related to this user that are considered "history" (you can define the logic)
      const historyOrders = await Order.find({ user: userId, status: 'Completed' });

      res.status(200).json({ orders: historyOrders });
  } catch (error) {
      console.error('Error fetching order history:', error.message);
      res.status(500).json({ message: 'Error fetching order history', error: error.message });
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
