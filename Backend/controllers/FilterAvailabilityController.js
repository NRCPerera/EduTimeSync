const User = require('../models/user');
const Schedule = require('../models/Schedule');
const ExaminerAvailability = require('../models/ExaminerAvailability');

exports.getExaminersAvailability = async (req, res) => {
  try {
    const examiners = await User.find({ role: 'Examiner' }).select('name _id');

    const examinerData = await Promise.all(
      examiners.map(async (examiner) => {
       
        const schedules = await Schedule.find({ examinerId: examiner._id });
        const currentLoad = schedules.length;
        const maxLoad = 5;

        const expertise = [...new Set(schedules.map(schedule => schedule.module))];

        // Get availability from ExaminerAvailability model
        const availabilities = await ExaminerAvailability.find({ 
          examinerId: examiner._id,
          date: { $gte: new Date() } // Only future dates
        }).sort('date');

        // Format availability for today and tomorrow (or next two available days)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Normalize to start of day
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const availability = [];
        let daysAdded = 0;
        for (const avail of availabilities) {
          if (daysAdded >= 2) break; // Limit to 2 days for simplicity
          const availDate = new Date(avail.date).toISOString().split('T')[0];
          if (new Date(availDate) >= today) {
            availability.push({
              day: availDate,
              slots: avail.availableSlots, // e.g., ["9:00 AM-10:00 AM", "10:00 AM-11:00 AM"]
            });
            daysAdded++;
          }
        }

        // If less than 2 days, fill with empty slots
        if (availability.length < 2) {
          const datesToAdd = [today, tomorrow].slice(availability.length);
          datesToAdd.forEach(date => {
            const dayStr = date.toISOString().split('T')[0];
            if (!availability.some(a => a.day === dayStr)) {
              availability.push({
                day: dayStr,
                slots: [], // No availability defined
              });
            }
          });
        }

        return {
          id: examiner._id.toString(),
          name: examiner.name,
          expertise: expertise.length > 0 ? expertise : ['General'],
          availability,
          currentLoad,
          maxLoad,
        };
      })
    );

    res.status(200).json(examinerData);
  } catch (error) {
    console.error('Error fetching examiners availability:', error);
    res.status(500).json({ message: 'Server error while fetching examiners availability' });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { eventId, examinerIds, message } = req.body;
    if (!eventId || !examinerIds || !message) {
      return res.status(400).json({ message: 'Event ID, examiner IDs, and message are required' });
    }

    await ExaminerAvailability.updateMany(
      { examinerId: { $in: examinerIds } },
      { 
        notificationStatus: { eventId, status: 'pending', updatedAt: new Date() },
      }
    );

    console.log('Notifications sent:', { eventId, examinerIds, message });
    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};