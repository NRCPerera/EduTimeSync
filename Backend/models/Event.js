// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15 }, // Duration of one exam in minutes
  module: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'pending', 'completed'], default: 'pending' },
  scheduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' }], // References to schedules
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);