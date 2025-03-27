// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.js');
// const router = express.Router();

// // Sign In Route
// router.post('/signin', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { userId: user._id, role: user.role }, // Include role in token payload
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' } // Token expires in 1 hour
//     );

//     // Send response
//     res.status(200).json({
//       message: 'Sign in successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('Sign in error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;