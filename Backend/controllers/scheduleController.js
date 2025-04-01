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
      .lean(); // Use lean() for plain JS objects

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
    console.log('Event:', event);
    console.log('Module to find:', event.module);
    if (event.scheduleIds.length > 0) {
      return res.status(400).json({ message: 'Event already scheduled' });
    }

    const registrations = await ModuleRegistration.find({ moduleCode: event.module });
    console.log('Registrations:', registrations.length);
    if (registrations.length < 1) {
      return res.status(400).json({ message: 'No students registered for this module' });
    }

    const examinerIds = event.examinerIds.map(id => id.toString()); // Use event-specific examinerIds
    console.log('Examiner IDs:', examinerIds);

    const scheduleResponse = await axios.post('http://localhost:5001/schedule', {
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      duration: event.duration,
      module: event.module,
      examinerIds,
      eventId: event._id,
    });

    const schedulesData = scheduleResponse.data.schedules;

    const schedules = await Promise.all(
      schedulesData.map(async (schedule) => {
        const newSchedule = new Schedule({
          ...schedule,
          eventId,
          startTime: new Date(schedule.startTime),
          endTime: new Date(schedule.endTime),
        });
        return await newSchedule.save();
      })
    );

    event.scheduleIds = schedules.map(s => s._id);
    await event.save();

    res.status(200).json({ message: 'Event scheduled successfully', schedules });
  } catch (error) {
    console.error('Error scheduling event:', error.response ? error.response.data : error.message);
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