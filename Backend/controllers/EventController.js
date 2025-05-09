const Event = require('../models/Event');
const User = require('../models/user');
const Module = require('../models/Module');
const Schedule = require('../models/Schedule');
const axios = require('axios');
const PDFDocument = require('pdfkit');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('examinerIds', 'name');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

exports.getExaminers = async (req, res) => {
  try {
    const examiners = await User.find({ role: 'Examiner' }).select('name _id');
    res.status(200).json(examiners);
  } catch (error) {
    console.error('Error fetching examiners:', error);
    res.status(500).json({ message: 'Server error while fetching examiners' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, startDate, endDate, duration, module, examinerIds } = req.body;
    if (!name || !startDate || !endDate || !duration || !module || !Array.isArray(examinerIds) || examinerIds.length === 0) {
      return res.status(400).json({ message: 'All fields are required, including at least one examiner' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const moduleDoc = await Module.findOne({ code: module });
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const examiners = await User.find({ _id: { $in: examinerIds }, role: 'Examiner' });
    if (examiners.length !== examinerIds.length) {
      return res.status(400).json({ message: 'One or more examiner IDs are invalid' });
    }

    const event = new Event({
      name,
      startDate: start,
      endDate: end,
      duration,
      module,
      examinerIds,
      status: 'pending',
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, duration, module, examinerIds } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    event.startDate = startDate ? new Date(startDate) : event.startDate;
    event.endDate = endDate ? new Date(endDate) : event.endDate;
    event.duration = duration || event.duration;
    event.module = module || event.module;
    if (examinerIds && Array.isArray(examinerIds)) {
      const examiners = await User.find({ _id: { $in: examinerIds }, role: 'Examiner' });
      if (examiners.length !== examinerIds.length) {
        return res.status(400).json({ message: 'One or more examiner IDs are invalid' });
      }
      event.examinerIds = examinerIds;
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Schedule.deleteMany({ eventId: id });
    await Event.deleteOne({ _id: id });
    res.status(200).json({ message: 'Event and related schedules deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
};

exports.generateEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    let events;

    if (eventId) {
      const event = await Event.findById(eventId)
        .populate('examinerIds', 'name')
        .populate('module', 'code name');
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      events = [event];
    } else {
      events = await Event.find()
        .populate('examinerIds', 'name')
        .populate('module', 'code name');
    }

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=event_report${eventId ? `_${eventId}` : ''}.pdf`);
      res.status(200).send(pdfData);
    });

    // Title
    doc.fontSize(20).text('Event Report', { align: 'center' });
    doc.moveDown(2);

    for (const event of events) {
      const schedules = await Schedule.find({ eventId: event._id }).populate('studentId', 'name');
      const students = schedules.map(schedule => ({
        studentId: schedule.studentId._id,
        name: schedule.studentId.name
      }));

      // Event Section
      doc.fontSize(14).text(`Event: ${event.name}`, { underline: true });
      doc.fontSize(12).text(`Module: ${event.module ? `${event.module.code} - ${event.module.name}` : 'N/A'}`);
      doc.text(`Start Date: ${event.startDate.toISOString().split('T')[0]}`);
      doc.text(`End Date: ${event.endDate.toISOString().split('T')[0]}`);
      doc.text(`Duration: ${event.duration} minutes`);
      doc.text(`Status: ${event.status}`);
      doc.moveDown();

      // Examiners Section
      doc.fontSize(12).text('Examiners:', { underline: true });
      if (event.examinerIds.length > 0) {
        event.examinerIds.forEach(examiner => {
          doc.text(`- ${examiner.name}`);
        });
      } else {
        doc.text('No examiners assigned');
      }
      doc.moveDown();

      // Students Section
      doc.fontSize(12).text('Students:', { underline: true });
      if (students.length > 0) {
        students.forEach(student => {
          doc.text(`- ${student.name}`);
        });
      } else {
        doc.text('No students assigned');
      }
      doc.moveDown(2);
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating event report:', error);
    res.status(500).json({ message: 'Server error while generating event report' });
  }
};