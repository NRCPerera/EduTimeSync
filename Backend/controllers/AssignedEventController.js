const AssignedEvent = require('../models/AssignEvent');

const getAssignedEvents = async (req, res) => {
  try {
    // Fetch all assigned events from the database
    const events = await AssignedEvent.find()
      .sort({ date: 1, time: 1 }); // Sort by date and time ascending

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching assigned events:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAssignedEvents };