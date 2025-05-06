const Schedule = require('../models/Schedule');
const ModuleRegistration = require('../models/ModuleRegistration');
const Event = require('../models/Event');
const User = require('../models/User');
const axios = require('axios');

exports.getExaminerSchedules = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    let query = { examinerId: req.user.id };
    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, error: 'Invalid month or year' });
      }
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      query.startTime = { $gte: startDate, $lte: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('studentId', 'email')
      .populate('examinerId', 'email')
      .lean();

    const formattedSchedules = schedules.map(schedule => ({
      ...schedule,
      startTime: schedule.startTime.toISOString(),
      endTime: schedule.endTime.toISOString(),
    }));

    res.status(200).json({
      success: true,
      count: formattedSchedules.length,
      data: formattedSchedules,
    });
  } catch (error) {
    console.error('Error fetching examiner schedules:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.getStudentSchedules = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    let query = { studentId: req.user.id };
    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, error: 'Invalid month or year' });
      }
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      query.startTime = { $gte: startDate, $lte: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('studentId', 'email')
      .populate('examinerId', 'email')
      .lean();

    const formattedSchedules = schedules
      .filter(schedule => {
        if (typeof schedule.startTime === 'string') {
          schedule.startTime = new Date(schedule.startTime);
        }
        if (typeof schedule.endTime === 'string') {
          schedule.endTime = new Date(schedule.endTime);
        }
        const isValidStartTime = schedule.startTime instanceof Date && !isNaN(schedule.startTime);
        const isValidEndTime = schedule.endTime instanceof Date && !isNaN(schedule.endTime);
        if (!isValidStartTime || !isValidEndTime) {
          console.warn('Invalid schedule found:', {
            scheduleId: schedule._id,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          });
          return false;
        }
        return true;
      })
      .map(schedule => ({
        ...schedule,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
      }));

    res.status(200).json({
      success: true,
      count: formattedSchedules.length,
      data: formattedSchedules,
    });
  } catch (error) {
    console.error('Error fetching student schedules:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.scheduleEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { startDate, endDate, duration, module, examinerIds } = req.body;

    if (!startDate || !endDate || !duration || !module || !examinerIds || !Array.isArray(examinerIds)) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }
    console.log('Received data:', { startDate, endDate, duration, module, examinerIds });
    // Validate examinerIds format (24-character hex strings)
    const hexStringRegex = /^[0-9a-fA-F]{24}$/;
    if (!examinerIds.every(id => typeof id === 'string' && hexStringRegex.test(id))) {
      console.error('Invalid examinerIds:', examinerIds);
      return res.status(400).json({ message: 'Examiner IDs must be valid 24-character hex strings' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.scheduleIds && event.scheduleIds.length > 0) {
      return res.status(400).json({ message: 'Event already scheduled' });
    }

    // Log the data being sent to Flask
    console.log('Sending to Flask:', { startDate, endDate, duration, module, examinerIds, eventId });

    // Call the Flask backend to generate schedules
    const flaskResponse = await axios.post('http://localhost:5001/schedule', {
      startDate,
      endDate,
      duration,
      module,
      examinerIds,
      eventId,
    });

    const { schedules, error } = flaskResponse.data;

    // Check for errors in the Flask response
    if (error) {
      return res.status(flaskResponse.status || 400).json({ message: error });
    }

    // Validate that schedules is an array
    if (!Array.isArray(schedules)) {
      console.error('Flask response:', flaskResponse.data);
      return res.status(500).json({ message: 'Invalid response from scheduling service: schedules is not an array' });
    }

    // Save schedules to MongoDB
    const savedSchedules = [];
    for (const schedule of schedules) {
      const newSchedule = new Schedule({
        eventId: event._id,
        studentId: schedule.studentId,
        examinerId: schedule.examinerId,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        module: schedule.module,
        googleMeetLink: schedule.googleMeetLink,
      });
      await newSchedule.save();
      savedSchedules.push(newSchedule);
    }

    // Update event with schedule IDs and status
    event.scheduleIds = savedSchedules.map(s => s._id);
    event.status = 'upcoming';
    await event.save();

    res.status(200).json({ message: 'Event scheduled successfully', schedules: savedSchedules });
  } catch (error) {
    console.error('Error scheduling event:', error.message, error.response ? error.response.data : '');
    const status = error.response ? error.response.status : 500;
    const message = error.response && error.response.data.error
      ? error.response.data.error
      : error.message || 'Server error while scheduling event';
    res.status(status).json({ message });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('studentId', 'email')
      .populate('examinerId', 'email')
      .lean();
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    if (schedule.studentId._id.toString() !== req.user.id && schedule.examinerId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this schedule' });
    }
    const formattedSchedule = {
      ...schedule,
      startTime: schedule.startTime.toISOString(),
      endTime: schedule.endTime.toISOString(),
    };
    res.status(200).json({
      success: true,
      data: formattedSchedule,
    });
  } catch (error) {
    console.error('Error fetching schedule by ID:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.rescheduleExam = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { proposedTime, examinerId, studentId } = req.body;

    if (!proposedTime || !examinerId || !studentId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: proposedTime, examinerId, studentId' });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    const rescheduleResponse = await axios.put(`http://localhost:5001/reschedule/${scheduleId}`, {
      proposedTime,
      examinerId,
      studentId,
    });

    const updatedSchedule = rescheduleResponse.data.schedule;

    res.status(200).json({
      success: true,
      message: 'Exam rescheduled successfully',
      data: {
        ...updatedSchedule,
        startTime: new Date(updatedSchedule.startTime).toISOString(),
        endTime: new Date(updatedSchedule.endTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error rescheduling exam:', error.response ? error.response.data : error.message);
    const status = error.response ? error.response.status : 500;
    const errorMessage = error.response && error.response.data.error ? error.response.data.error : 'Server error';
    res.status(status).json({ success: false, error: errorMessage });
  }
};