const mongoose = require('mongoose');

const ExaminerAvailabilitySchema = new mongoose.Schema({
  examinerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add examiner ID'],
  },
  module: {
    type: String,
    required: [true, 'Please add module name'],
    trim: true,
  },
  weekStart: {
    type: Date,
    required: [true, 'Please add week start date'],
  },
  timeSlots: {
    Monday: { type: [String], default: [] },
    Tuesday: { type: [String], default: [] },
    Wednesday: { type: [String], default: [] },
    Thursday: { type: [String], default: [] },
    Friday: { type: [String], default: [] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notificationStatus: {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    updatedAt: { type: Date },
  }
});

ExaminerAvailabilitySchema.pre('save', function (next) {
  const now = new Date();
  if (this.date <= now) {
    throw new Error('Date must be in the future');
  }
  next();
});
ExaminerAvailabilitySchema.index({ weekStart: 1, examinerId: 1 }, { unique: true });
module.exports = mongoose.model('ExaminerAvailability', ExaminerAvailabilitySchema);