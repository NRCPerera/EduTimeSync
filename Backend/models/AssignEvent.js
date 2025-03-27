const mongoose = require('mongoose');

const AssignedEventSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true,
  },
  studentId: {
    type: String,
    required: [true, 'Please add student ID'],
    trim: true,
    unique: true, 
  },
  module: {
    type: String,
    required: [true, 'Please add module name'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Please add date'],
  },
  time: {
    type: String,
    required: [true, 'Please add time slot'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed'],
    required: [true, 'Please specify status'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AssignedEvent', AssignedEventSchema);