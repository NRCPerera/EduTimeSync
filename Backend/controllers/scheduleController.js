const Schedule = require('../models/Schedule');
const { check, validationResult } = require('express-validator');

// Validation middleware
exports.validateSchedule = [
  check('studentId', 'Student ID is required').not().isEmpty(),
  check('examinerId', 'Examiner ID is required').not().isEmpty(),
  check('module', 'Module is required').not().isEmpty(),
  check('scheduledTime.date', 'Date is required').not().isEmpty(),
  check('scheduledTime.startTime', 'Start time is required').not().isEmpty(),
  check('scheduledTime.endTime', 'End time is required').not().isEmpty(),
  check('googleMeetLink', 'Google Meet link must be a valid URL').optional().isURL(),
];

// Get schedules for the logged-in examiner
exports.getExaminerSchedules = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = {
      examinerId: req.user.id, // Filter by logged-in examiner
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query['scheduledTime.date'] = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      };
    }

    const schedules = await Schedule.find(query)
      .populate('studentId', 'email')
      .populate('examinerId', 'email');

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

// Get schedules for the logged-in student
exports.getStudentSchedules = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = {
      studentId: req.user.id, // Filter by logged-in student
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query['scheduledTime.date'] = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      };
    }

    const schedules = await Schedule.find(query)
      .populate('studentId', 'email')
      .populate('examinerId', 'email');

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
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
        errors: errors.array(),
      });
    }

    const schedule = await Schedule.create(req.body);
    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('studentId', 'email')
      .populate('examinerId', 'email');
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }
    // Check if the user is either the student or examiner
    if (schedule.studentId.toString() !== req.user.id && schedule.examinerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this schedule',
      });
    }
    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};