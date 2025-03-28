const Event = require('../models/Event');
const User = require('../models/user');

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

// Get all examiners
exports.getExaminers = async (req, res) => {
  try {
    const examiners = await User.find({ role: 'Examiner' }).select('name -_id');
    const examinerNames = examiners.map(examiner => examiner.name);
    res.status(200).json(examinerNames);
  } catch (error) {
    console.error('Error fetching examiners:', error);
    res.status(500).json({ message: 'Server error while fetching examiners' });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { name, date, duration, examiners, module } = req.body;
    if (!name || !date || !duration || !module || !Array.isArray(examiners)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = new Event({
      name,
      date,
      duration,
      examiners,
      module,
      status: 'pending',
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, duration, examiners, module } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    event.date = date || event.date;
    event.duration = duration || event.duration;
    event.examiners = examiners || event.examiners;
    event.module = module || event.module;

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.deleteOne({ _id: id });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
};