const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15 },
  examiners: [{ type: String }],
  module: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);