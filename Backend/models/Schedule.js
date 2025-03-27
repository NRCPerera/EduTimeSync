const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examinerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    module: { type: String, required: true },
    scheduledTime: { 
        date: { type: String, required: true }, 
        startTime: { type: String, required: true }, 
        endTime: { type: String, required: true }
    },
    googleMeetLink: { type: String }
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
