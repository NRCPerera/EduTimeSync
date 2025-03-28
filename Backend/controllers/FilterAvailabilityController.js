const User = require('../models/user');
const Schedule = require('../models/Schedule');

exports.getExaminersAvailability = async (req, res) => {
  try {
    const examiners = await User.find({ role: 'Examiner' }).select('name _id');
    const allTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    const examinerData = await Promise.all(
      examiners.map(async (examiner) => {
        const schedules = await Schedule.find({ examinerId: examiner._id });
        const currentLoad = schedules.length;
        const maxLoad = 5;

        const scheduledTimes = schedules.map(schedule => ({
          day: schedule.scheduledTime.date.toISOString().split('T')[0],
          slots: schedule.scheduledTime.slots.map(slot => slot.startTime),
        }));

        const today = new Date();
        const availability = [
          { day: today.toISOString().split('T')[0], slots: [] },
          { day: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], slots: [] },
        ];

        availability.forEach(dayObj => {
          const scheduledForDay = scheduledTimes.find(st => st.day === dayObj.day);
          dayObj.slots = scheduledForDay
            ? allTimeSlots.filter(slot => !scheduledForDay.slots.includes(slot))
            : [...allTimeSlots];
        });

        const expertise = [...new Set(schedules.map(schedule => schedule.module))] || [];
        return {
          id: examiner._id.toString(),
          name: examiner.name,
          expertise: expertise.length > 0 ? expertise[0] : 'General',
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