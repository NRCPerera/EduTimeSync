const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');
const Event = require('../models/Event');
const User = require('../models/user');

exports.sendNotification = async (req, res) => {
  try {
    const { eventId, examinerIds, message } = req.body;

    if (!eventId || !examinerIds || !message) {
      return res.status(400).json({ message: 'Event ID, examiner IDs, and message are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const examiners = await User.find({ _id: { $in: examinerIds } });
    if (examiners.length !== examinerIds.length) {
      return res.status(404).json({ message: 'One or more examiners not found' });
    }

    const eventDetails = `Event: ${event.name}\nModule: ${event.module}\nDate: ${new Date(event.startDate).toLocaleString()}\nDuration: ${event.duration} minutes`;
    const fullMessage = `${message}\n\n${eventDetails}\n\nPlease respond at: http://localhost:3000/examiner-schedule`;

    const notifications = [];
    const assignments = [];
    for (const examinerId of examinerIds) {
      const notification = new Notification({
        eventId,
        examinerId,
        message: fullMessage,
        status: 'pending',
      });
      await notification.save();
      notifications.push(notification);

      const assignment = new Assignment({
        eventId,
        examinerId,
        notificationId: notification._id,
        status: 'pending',
      });
      await assignment.save();
      assignments.push(assignment);
    }

    // Simulate sending email (replace with Nodemailer)
    console.log(`Sending notifications for event ${eventId}:`, notifications);

    res.status(200).json({ message: 'Notifications and assignments created successfully' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotificationStatuses = async (req, res) => {
  try {
    const { eventId } = req.params;

    const assignments = await Assignment.find({ eventId })
      .populate('examinerId', 'name email')
      .lean();

    const statuses = assignments.map(assignment => ({
      id: assignment.examinerId._id,
      name: assignment.examinerId.name,
      email: assignment.examinerId.email,
      status: assignment.status,
      declineReason: assignment.declineReason || null,
      updatedAt: assignment.updatedAt,
    }));

    res.status(200).json(statuses);
  } catch (error) {
    console.error('Get notification statuses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};