const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Sign In Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include role in token payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send response
    res.status(200).json({
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Sign-up page
router.post('/signup', async (req, res) => {
    const { username, email, password, nic, phoneNumber, address } = req.body;
  
    // Input validation
    if (!username || !email || !password || !nic || !phoneNumber || !address) {
      return res.status(400).json({ message: 'Please fill out all required fields' });
    }
  
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
  
    // Phone number validation
    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    }
  
    // NIC validation
    const nicRegex = /^[0-9]{9}[vVxX]$/;
    if (!nicRegex.test(nic)) {
      return res.status(400).json({ message: 'Please enter a valid NIC (e.g., 123456789V)' });
    }
  
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user (default role as 'Student' since frontend doesn't provide it)
      const newUser = new User({
        name: username, // Mapping username to name
        email,
        password: hashedPassword,
        role: 'Student', // Default role; adjust if needed
      });
  
      await newUser.save();
  
      // Optionally generate JWT for immediate sign-in
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(201).json({
        message: 'Sign up successful',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error('Sign up error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;