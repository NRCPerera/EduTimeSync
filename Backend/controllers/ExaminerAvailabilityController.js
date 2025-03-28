const ExaminerAvailability = require('../models/ExaminerAvailability');

const submitExaminerAvailability = async (req, res) => {
  const { name, module, date, availableSlots } = req.body; // Changed examinerName to name

  // Basic input validation (Mongoose schema validation will also kick in)
  if (!name || !module || !date || !availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
    return res.status(400).json({ message: 'All fields are required, and at least one time slot must be selected' });
  }

  try {
    // Parse date in MM/DD/YYYY format to ensure correct Date object
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use MM/DD/YYYY' });
    }

    // Create new availability document
    const availability = new ExaminerAvailability({ // Renamed variable to avoid conflict
      examinerName: name, // Map 'name' from request to 'examinerName' in schema
      module,
      date: parsedDate,
      availableSlots,
    });

    // Save to database; pre('save') middleware will check if date is in future
    await availability.save();

    res.status(201).json({
      message: 'Availability submitted successfully',
      availability: {
        id: availability._id,
        examinerName: availability.examinerName,
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