const mongoose = require('mongoose');

const ExaminerAvailabilitySchema = new mongoose.Schema({
  examinerName: {
    type: String,
    required: [true, 'Please add examiner name'],
    trim: true,
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
  availableSlots: {
    type: [String],
    required: [true, 'Please select at least one time slot'],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'Please select at least one time slot',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ExaminerAvailabilitySchema.pre('save', function (next) {
  const now = new Date();
  if (this.date <= now) {
    throw new Error('Date must be in the future');
  }
  next();
});

module.exports = mongoose.model('ExaminerAvailability', ExaminerAvailabilitySchema);





