// backend/models/Schedule.js
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  googleMeetLink: { type: String },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);