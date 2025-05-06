const Schedule = require('../models/Schedule');
const ModuleRegistration = require('../models/ModuleRegistration');
const Event = require('../models/Event');
const User = require('../models/user');
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

    // Format dates to ISO strings
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
        // Convert string-based dates to Date objects
        if (typeof schedule.startTime === 'string') {
          schedule.startTime = new Date(schedule.startTime);
        }
        if (typeof schedule.endTime === 'string') {
          schedule.endTime = new Date(schedule.endTime);
        }
        // Validate that startTime and endTime are valid Dates
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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.scheduleIds && event.scheduleIds.length > 0) {
      return res.status(400).json({ message: 'Event already scheduled' });
    }

    const registrations = await ModuleRegistration.find({ moduleCode: event.module });
    if (registrations.length < 1) {
      return res.status(400).json({ message: 'No students registered for this module' });
    }

    let examinerIds = [];
    if (event.examinerIds && Array.isArray(event.examinerIds)) {
      examinerIds = event.examinerIds.map(id => id.toString());
    } else if (event.examinerIds) {
      examinerIds = [event.examinerIds.toString()];
    }

    if (examinerIds.length === 0) {
      return res.status(400).json({ message: 'No examiners assigned to this event' });
    }

    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    const totalStudents = registrations.length;
    const durationInMinutes = event.duration;

    const schedules = [];

    let currentTime = new Date(startTime);
    let examinerIndex = 0;

    for (let i = 0; i < totalStudents; i++) {
      const student = registrations[i].studentId;
      const examinerId = examinerIds[examinerIndex];

      const scheduleStart = new Date(currentTime);
      const scheduleEnd = new Date(currentTime.getTime() + durationInMinutes * 60000);

      // Stop scheduling if we exceed end date
      if (scheduleEnd > endTime) {
        break;
      }

      const newSchedule = new Schedule({
        eventId: event._id,
        studentId: student,
        examinerId: examinerId,
        startTime: scheduleStart,
        endTime: scheduleEnd,
      });

      await newSchedule.save();
      schedules.push(newSchedule);

      currentTime = new Date(scheduleEnd); // move to next slot
      examinerIndex = (examinerIndex + 1) % examinerIds.length; // round robin
    }

    event.scheduleIds = schedules.map(s => s._id);
    await event.save();

    res.status(200).json({ message: 'Event scheduled successfully', schedules });
  } catch (error) {
    console.error('Error scheduling event:', error.message);
    res.status(500).json({ message: 'Server error while scheduling event' });
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