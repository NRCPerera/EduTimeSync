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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    let query = {
      examinerId: req.user.id, // Changed to req.user.id for consistency
    };

    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, error: 'Invalid month or year' });
      }
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      // console.log("Start Date:", startDate.toISOString().split('T')[0]);
      // console.log("End Date:", endDate.toISOString().split('T')[0]);
      query['scheduledTime.date'] = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      };
    }

    //

    const schedules = await Schedule.find(query)
      .populate('studentId', 'email') // Changed to email for consistency with frontend
      .populate('examinerId', 'email');

    //console.log("Fetched Schedules:", schedules);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    //console.error("Error Fetching Examiner Schedules:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Get schedules for the logged-in student
exports.getStudentSchedules = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // console.log("Logged-in Student ID:", req.user.id);
    // console.log("Query params:", { month, year });

    let query = {
      studentId: req.user.id,
    };

    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, error: 'Invalid month or year' });
      }
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      query['scheduledTime.date'] = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      };
    }

    //console.log("MongoDB Query:", query);

    const schedules = await Schedule.find(query)
      .populate('studentId', 'email')
      .populate('examinerId', 'email');

    //console.log("Fetched Schedules:", schedules);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    //console.error("Error Fetching Student Schedules:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
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