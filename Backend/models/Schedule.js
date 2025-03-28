const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g., "9:00 AM"
  endTime: { type: String, required: true },   // e.g., "10:00 AM"
});

// Sub-schema for scheduledTime
const ScheduledTimeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  slots: [TimeSlotSchema],  
});

// Main Schedule schema
const ScheduleSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: String, required: true },
  scheduledTime: { type: ScheduledTimeSchema, required: true },
  googleMeetLink: { type: String, required: false },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);