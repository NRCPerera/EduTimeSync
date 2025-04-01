const RescheduleRequest = require('../models/RescheduleRequest');
const Schedule = require('../models/Schedule');
const { check, validationResult } = require('express-validator');

// Validation middleware
exports.validateRescheduleRequest = [
  check('scheduleId', 'Schedule ID is required').not().isEmpty(),
  check('proposedTime.date', 'Proposed date is required').not().isEmpty(),
  check('proposedTime.startTime', 'Proposed start time is required').not().isEmpty(),
  check('proposedTime.endTime', 'Proposed end time is required').not().isEmpty(),
  check('reason', 'Reason for rescheduling is required').not().isEmpty(),
];

// Create a reschedule request (Examiner only)
exports.createRescheduleRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { scheduleId, proposedTime, reason } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    if (schedule.examinerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to reschedule this exam' });
    }

    const existingRequest = await RescheduleRequest.findOne({ scheduleId, examinerId: req.user.id });
    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'A reschedule request already exists for this schedule' });
    }

    const request = await RescheduleRequest.create({
      scheduleId,
      examinerId: req.user.id,
      proposedTime,
      reason,
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Create reschedule request error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Get all reschedule requests (LIC only)
exports.getAllRescheduleRequests = async (req, res) => {
  try {
    if (req.user.role !== 'LIC') {
      return res.status(403).json({ success: false, error: 'Access denied. LIC only.' });
    }

    const requests = await RescheduleRequest.find()
      .populate('examinerId', 'email name')
      .populate('scheduleId', 'module scheduledTime');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get reschedule requests error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Update reschedule request status (LIC only)
exports.updateRescheduleRequest = async (req, res) => {
  try {
    if (req.user.role !== 'LIC') {
      return res.status(403).json({ success: false, error: 'Access denied. LIC only.' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be "approved" or "rejected"' });
    }

    const request = await RescheduleRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Reschedule request not found' });
    }

    request.status = status;
    await request.save();

    if (status === 'approved') {
      const schedule = await Schedule.findById(request.scheduleId);
      if (!schedule) {
        return res.status(404).json({ success: false, error: 'Associated schedule not found' });
      }
      schedule.scheduledTime = request.proposedTime;
      await schedule.save();
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Update reschedule request error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }

//   exports.getExaminerRescheduleRequests = async (req, res) => {
//     try {
//       const requests = await RescheduleRequest.find({ examinerId: req.user.id })
//         .populate('scheduleId', 'module', 'scheduledTime', 'googleMeetLink');
  
//       res.status(200).json({
//         success: true,
//         count: requests.length,
//         data: requests,
//       });
//     } catch (error) {
//       console.error('Get examiner reschedule requests error:', error);
//       res.status(500).json({ success: false, error: error.message || 'Server error' });
//     }
//   };
};