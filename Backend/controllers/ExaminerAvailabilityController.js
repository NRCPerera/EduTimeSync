const ExaminerAvailability = require('../models/ExaminerAvailability');

exports.getExaminersAvailability = async function(req, res) {
  try {
    const { weekStart } = req.query;
    const examinerId = req.user.id;

    if (!weekStart) {
      return res.status(400).json({ message: 'weekStart query parameter is required' });
    }

    const weekStartDate = new Date(weekStart);

    const availabilityDoc = await ExaminerAvailability.findOne({ weekStart: weekStartDate, examinerId });

    if (!availabilityDoc) {
      return res.status(200).json({ availability: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] } });
    }

    res.status(200).json({ availability: availabilityDoc.timeSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

exports.submitExaminerAvailability = async function(req, res) {
  try {
    const { weekStart, availability } = req.body;
    const examinerId = req.user.id;

    if (!weekStart || !availability) {
      return res.status(400).json({ message: 'weekStart and availability are required' });
    }

    const weekStartDate = new Date(weekStart);

    const updateDoc = {
      timeSlots: availability,
      examinerId
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const savedAvailability = await ExaminerAvailability.findOneAndUpdate(
      { weekStart: weekStartDate, examinerId },
      updateDoc,
      options
    );

    res.status(200).json({ message: 'Availability saved successfully', availability: savedAvailability.timeSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}