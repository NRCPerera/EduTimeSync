const ExaminerAvailability = require("../models/ExaminerAvailability");

exports.setAvailability = async (req, res) => {
    try {
        const { examinerId, availableSlots } = req.body;
        await ExaminerAvailability.findOneAndUpdate(
            { examinerId },
            { examinerId, availableSlots },
            { upsert: true }
        );
        res.json({ message: "Availability updated" });
    } catch (error) {
        res.status(500).json({ error: "Error setting availability" });
    }
};
