const mongoose = require('mongoose');

// Sub-schema for scheduledTime
const ScheduledTimeSchema = new mongoose.Schema({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
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