const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15 },
  module: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'pending', 'completed'], default: 'pending' },
  examinerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  scheduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);