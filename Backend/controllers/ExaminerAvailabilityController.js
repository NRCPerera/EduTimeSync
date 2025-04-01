// backend/controllers/examinerAvailabilityController.js
const ExaminerAvailability = require('../models/ExaminerAvailability');

const submitExaminerAvailability = async (req, res) => {
  const { module, date, availableSlots } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!module || !date || !availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
    return res.status(400).json({ message: 'All fields are required, and at least one time slot must be selected' });
  }

  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use MM/DD/YYYY' });
    }

    const availability = new ExaminerAvailability({
      examinerId: req.user.id,
      module,
      date: parsedDate,
      availableSlots,
    });

    await availability.save();

    res.status(201).json({
      message: 'Availability submitted successfully',
      availability: {
        id: availability._id,
        examinerId: availability.examinerId,
        module: availability.module,
        date: availability.date,
        availableSlots: availability.availableSlots,
        createdAt: availability.createdAt,
      },
    });
  } catch (error) {
    console.error('Availability submission error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Date must be in the future') {
      return res.status(400).json({ message: 'Date must be in the future' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitExaminerAvailability };