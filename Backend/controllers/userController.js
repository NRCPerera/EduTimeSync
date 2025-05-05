const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Sign In Controller
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {  
      console.error('JWT_SECRET is not defined in environment variables');  
    } 


    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Sign-in successful:', { userId: user._id, role: user.role });
    console.log('Token generated:', token ? 'Yes' : 'No');

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
};

// Sign Up Controller
exports.signUp = async (req, res) => {

    const { name, email, password, nic, phoneNumber, address, role } = req.body;
  
    // Require only username, email, and password; others optional
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
  
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    }
  
    // NIC validation optional
    // if (nic && !/^[0-9]{9}[vVxX]$/.test(nic)) {
    //   return res.status(400).json({ message: 'Please enter a valid NIC (e.g., 123456789V)' });
    // }
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        name: name,
        email,
        password: hashedPassword,
        role: role || 'Student', // Allow role override from request
        nic: nic || '',          // Default to empty string if not provided
        phoneNumber: phoneNumber || '',
        address: address || '',
      });
  
      await newUser.save();
  
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
          nic: newUser.nic,
          phoneNumber: newUser.phoneNumber,
          address: newUser.address,
        },
      });
    } catch (error) {
      console.error('Sign up error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Get Current User Controller
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User details retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nic: user.nic,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getLicsAndExaminers = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const users = await User.find({ role: { $in: ['LIC', 'Examiner'] } }).select('+password');
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Get LICs/Examiners error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Update User (Admin only)
  exports.updateUser = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const { name, email, role, nic, phoneNumber, address } = req.body;
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.nic = nic || user.nic;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;
  
      await user.save();
  
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Delete User (Admin only)
  exports.deleteUser = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
  
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.getStudentRegistrations = async (req, res) => {
    try {
      const registrations = await ModuleRegistration.find({ studentId: req.user.id })
        .populate('studentId', 'name email');
      res.status(200).json({ success: true, data: registrations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
