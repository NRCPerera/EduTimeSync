const mongoose = require('mongoose');

const moduleRegistrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moduleCode: {
    type: String,
    required: true,
    trim: true, // References Module.code
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ModuleRegistration', moduleRegistrationSchema);