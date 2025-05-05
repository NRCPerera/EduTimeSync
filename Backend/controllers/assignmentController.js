const Assignment = require('../models/Assignment');
const Event = require('../models/Event');

// Get assignments for the logged-in examiner
exports.getExaminerAssignments = async (req, res) => {
  try {
    const examinerId = req.user.id; // From JWT
    const assignments = await Assignment.find({ examinerId })
      .populate('eventId', 'name startDate duration module')
      .lean();

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment._id,
      event: {
        id: assignment.eventId._id,
        name: assignment.eventId.name,
        date: assignment.eventId.startDate,
        duration: assignment.eventId.duration,
        module: assignment.eventId.module,
      },
      status: assignment.status,
      declineReason: assignment.declineReason || null,
    }));

    res.status(200).json(formattedAssignments);
  } catch (error) {
    console.error('Get examiner assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to an assignment (accept or decline)
exports.respondToAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, declineReason } = req.body;
    const examinerId = req.user.id;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.examinerId.toString() !== examinerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (status === 'declined' && !declineReason) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }

    assignment.status = status;
    assignment.declineReason = status === 'declined' ? declineReason : null;
    await assignment.save();

    res.status(200).json({ message: `Assignment ${status} successfully` });
  } catch (error) {
    console.error('Respond to assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};