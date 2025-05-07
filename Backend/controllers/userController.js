const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ModuleRegistration = require('../models/ModuleRegistration'); // Assuming you have a ModuleRegistration model

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

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

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
      role: role || 'Student',
      nic: nic || '',
      phoneNumber: phoneNumber || '',
      address: address || '',
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

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
    const user = await User.findById(req.user.id).select('+password');
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

// Get LICs and Examiners
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

// Get Student Registrations
exports.getStudentRegistrations = async (req, res) => {
  try {
    const registrations = await ModuleRegistration.find({ studentId: req.user.id }).populate(
      'studentId',
      'name email'
    );
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate PDF for LICs or Examiners
exports.generateUsersPDF = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const role = req.params.role; // 'LIC' or 'Examiner'
    if (!['LIC', 'Examiner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users = await User.find({ role }).select('name email nic phoneNumber address');

    if (!users || users.length === 0) {
      return res.status(404).json({ message: `No ${role}s found` });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `${role}s_List_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);

    // Ensure temp directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF Header
    doc.fontSize(20).font('Helvetica-Bold').text(`${role} List`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });
    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    const tableLeft = 50;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Name', tableLeft, tableTop, { width: 100 });
    doc.text('Email', tableLeft + 100, tableTop, { width: 150 });
    doc.text('NIC', tableLeft + 250, tableTop, { width: 100 });
    doc.text('Phone', tableLeft + 350, tableTop, { width: 100 });
    doc.text('Address', tableLeft + 450, tableTop, { width: 100 });

    // Draw table header underline
    doc
      .moveTo(tableLeft, tableTop + 15)
      .lineTo(tableLeft + 500, tableTop + 15)
      .stroke();

    // Table Rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(10);
    users.forEach((user) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.text(user.name || '-', tableLeft, y, { width: 100 });
      doc.text(user.email || '-', tableLeft + 100, y, { width: 150 });
      doc.text(user.nic || '-', tableLeft + 250, y, { width: 100 });
      doc.text(user.phoneNumber || '-', tableLeft + 350, y, { width: 100 });
      doc.text(user.address || '-', tableLeft + 450, y, { width: 100 });
      y += 20;
    });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error sending PDF:', err);
          res.status(500).json({ message: 'Error sending PDF' });
        }
        // Clean up the file after download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting PDF file:', unlinkErr);
        });
      });
    });
  } catch (error) {
    console.error(`Generate ${req.params.role} PDF error:，所要的不是原來的 document 而是改進後的 document 錯誤: ${error}`);
    res.status(500).json({ message: 'Server error' });
  }
};