const mongoose = require("mongoose");

const ExaminerAvailabilitySchema = new mongoose.Schema({
    examinerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    availableSlots: [{ date: String, startTime: String, endTime: String }],
});

module.exports = mongoose.model("ExaminerAvailability", ExaminerAvailabilitySchema);
