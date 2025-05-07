const Event = require('../models/Event');
const User = require('../models/user');
const Module = require('../models/Module');
const Schedule = require('../models/Schedule');
const axios = require('axios');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('examinerIds', 'name');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

exports.getExaminers = async (req, res) => {
  try {
    const examiners = await User.find({ role: 'Examiner' }).select('name _id');
    res.status(200).json(examiners);
  } catch (error) {
    console.error('Error fetching examiners:', error);
    res.status(500).json({ message: 'Server error while fetching examiners' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, startDate, endDate, duration, module, examinerIds } = req.body;
    if (!name || !startDate || !endDate || !duration || !module || !Array.isArray(examinerIds) || examinerIds.length === 0) {
      return res.status(400).json({ message: 'All fields are required, including at least one examiner' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const moduleDoc = await Module.findOne({ code: module });
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const examiners = await User.find({ _id: { $in: examinerIds }, role: 'Examiner' });
    if (examiners.length !== examinerIds.length) {
      return res.status(400).json({ message: 'One or more examiner IDs are invalid' });
    }

    const event = new Event({
      name,
      startDate: start,
      endDate: end,
      duration,
      module,
      examinerIds,
      status: 'pending',
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, duration, module, examinerIds } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    event.startDate = startDate ? new Date(startDate) : event.startDate;
    event.endDate = endDate ? new Date(endDate) : event.endDate;
    event.duration = duration || event.duration;
    event.module = module || event.module;
    if (examinerIds && Array.isArray(examinerIds)) {
      const examiners = await User.find({ _id: { $in: examinerIds }, role: 'Examiner' });
      if (examiners.length !== examinerIds.length) {
        return res.status(400).json({ message: 'One or more examiner IDs are invalid' });
      }
      event.examinerIds = examinerIds;
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Schedule.deleteMany({ eventId: id });
    await Event.deleteOne({ _id: id });
    res.status(200).json({ message: 'Event and related schedules deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
};