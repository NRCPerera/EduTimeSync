const Schedule = require('../models/scheduleModel');
const { check, validationResult } = require('express-validator');

// Validation middleware
exports.validateSchedule = [
  check('subject', 'Subject is required').not().isEmpty(),
  check('date', 'Date is required').isISO8601(),
  check('time', 'Time is required').not().isEmpty(),
  check('duration', 'Duration is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('examiner', 'Examiner is required').not().isEmpty(),
  check('mode', 'Mode must be In-person or Online').isIn(['In-person', 'Online']),
  check('participants', 'Participants must be a number').isNumeric()
];

// Get all schedules with month filter
exports.getAllSchedules = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const schedules = await Schedule.find(query);
    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

// Create new schedule
exports.createSchedule = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const schedule = await Schedule.create(req.body);
    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};