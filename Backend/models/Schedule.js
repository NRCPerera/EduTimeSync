const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examinerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    module: { type: String, required: true },
    scheduledTime: { date: String, startTime: String, endTime: String, required: true },
    googleMeetLink: { type: String, required: false },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
