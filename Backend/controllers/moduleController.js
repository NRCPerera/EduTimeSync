const Module = require('../models/Module');
const User = require('../models/user');
const ModuleRegistration = require('../models/ModuleRegistration');

exports.registerModule = async (req, res) => {
  try {
    const { moduleCode, password } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can register for modules' });
    }

    // Find the module by code
    const module = await Module.findOne({ code: moduleCode });
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    // Validate password
    if (module.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect module password' });
    }

    // Check if student is already registered
    const existingRegistration = await ModuleRegistration.findOne({
      studentId: req.user.id,
      moduleCode: moduleCode,
    });
    if (existingRegistration) {
      return res.status(400).json({ success: false, error: 'You are already registered for this module' });
    }

    // Create new registration
    const registration = await ModuleRegistration.create({
      studentId: req.user.id,
      moduleCode: moduleCode,
    });

    res.status(200).json({
      success: true,
      data: {
        moduleCode: module.code,
        moduleName: module.name,
      },
    });
  } catch (error) {
    console.error('Register module error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Optional: Create a module (for LIC use)
exports.createModule = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only LICs can create modules' });
    }

    const { code, name, password } = req.body;
    const module = await Module.create({ code, name, password });

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.getAllModules = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only LICs can view all modules' });
    }

    const modules = await Module.find();
    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    console.error('Get all modules error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

