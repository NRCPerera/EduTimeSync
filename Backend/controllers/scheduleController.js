const Schedule = require("../models/Schedule");

exports.schedulePresentation = async (req, res) => {
    try {
        const { studentId, examinerId, module, scheduledTime, googleMeetLink } = req.body;
        const schedule = new Schedule({ studentId, examinerId, module, scheduledTime, googleMeetLink });
        await schedule.save();
        res.json({ message: "Presentation scheduled successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error scheduling presentation" });
    }
};
