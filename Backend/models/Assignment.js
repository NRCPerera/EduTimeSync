const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  declineReason: { type: String, required: function() { return this.status === 'declined'; } },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

assignmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);