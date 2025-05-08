const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  module: { type: String, required: true },
  grade: { type: Number, required: true, min: 0, max: 100 },
  presentation: { type: String },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);