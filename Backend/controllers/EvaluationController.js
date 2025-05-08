const Schedule = require('../models/Schedule');
const Evaluation = require('../models/Evaluation');
const PDFDocument = require('pdfkit');

exports.getStudentsForEvaluation = async (req, res) => {
  try {
    const examinerId = req.query.examinerId; // Get examinerId from query parameter
    if (!examinerId) {
      return res.status(400).json({ message: 'examinerId is required' });
    }

    const schedules = await Schedule.find({ examinerId }).populate('studentId', 'name');
    const students = await Promise.all(
      schedules.map(async (schedule) => {
        const evaluation = await Evaluation.findOne({
          studentId: schedule.studentId,
          examinerId,
          module: schedule.module,
        });
        return {
          id: schedule.studentId._id.toString(), // Ensure ID is a string for frontend
          name: schedule.studentId.name,
          module: schedule.module,
          grade: evaluation ? evaluation.grade : '',
          presentation: evaluation ? evaluation.presentation : '',
          evaluated: !!evaluation,
          scheduleId: schedule._id.toString(),
        }
      })
    );
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
};

exports.submitEvaluations = async (req, res) => {
  try {
    const { examinerId, evaluations } = req.body; 
    if (!examinerId || !Array.isArray(evaluations) || evaluations.length === 0) {
      return res.status(400).json({ message: 'examinerId and evaluations array are required' });
    }

    const savedEvaluations = await Promise.all(
      evaluations.map(async (eval) => {
        const { studentId, grade, scheduleId, module, presentation } = eval;
        const existingEval = await Evaluation.findOne({ studentId, examinerId, scheduleId, module });
        if (existingEval) {
          // Update existing evaluation
          existingEval.grade = grade;
          existingEval.presentation = presentation;
          return existingEval.save();
        }

        const evaluation = new Evaluation({
          studentId,
          examinerId,
          scheduleId,
          module,
          grade,
          presentation,
        });
        return evaluation.save();
      })
    );

    const successfulEvaluations = savedEvaluations.filter((eval) => eval !== null);
    res.status(201).json({
      message: 'Evaluations submitted successfully',
      evaluations: successfulEvaluations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while submitting evaluations' });
  }
};

exports.getStudentEvaluation = async (req, res) => {
  try {
    const studentId = req.query.studentId; // Get studentId from query parameter
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const evaluations = await Evaluation.find({ studentId }).populate('examinerId', 'name');
    const formattedEvaluations = evaluations.map((evaluation) => ({
      id: evaluation._id.toString(), // Ensure ID is a string for frontend
      module: evaluation.module,
      grade: evaluation.grade,
      presentation: evaluation.presentation,
      examinerName: evaluation.examinerId.name,
    }));
    res.status(200).json(formattedEvaluations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching evaluations' });
  }
};

exports.getScheduleEvaluation = async (req, res) => {
  try {
    const { scheduleId, examinerId } = req.query;
    
    if (!scheduleId || !examinerId) {
      return res.status(400).json({ message: 'scheduleId and examinerId are required' });
    }

    const schedule = await Schedule.findById(scheduleId).populate('studentId', 'name');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const evaluation = await Evaluation.findOne({
      studentId: schedule.studentId,
      examinerId,
      module: schedule.module,
      scheduleId
    });

    const response = {
      studentId: schedule.studentId._id.toString(),
      studentName: schedule.studentId.name,
      module: schedule.module,
      grade: evaluation ? evaluation.grade : '',
      presentation: evaluation ? evaluation.presentation : '',
      evaluated: !!evaluation,
      scheduleId: schedule._id.toString()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching schedule evaluation' });
  }
};

exports.generateEventGradeReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Fetch all evaluated schedules for the event
    const schedules = await Schedule.find({
      eventId,
      examinerId: req.user.id,
    })
      .populate('studentId', 'name email')
      .populate('eventId', 'name')
      .lean();

    if (!schedules.length) {
      return res.status(404).json({ success: false, error: 'No schedules found for this event' });
    }

    // Fetch evaluations for all schedules
    const schedulesWithEvaluations = await Promise.all(
      schedules.map(async (schedule) => {
        const evaluation = await Evaluation.findOne({
          scheduleId: schedule._id,
          studentId: schedule.studentId._id,
          examinerId: req.user.id,
        }).lean();

        return {
          ...schedule,
          evaluation: evaluation ? {
            grade: evaluation.grade,
            presentation: evaluation.presentation || '',
          } : null,
          eventName: schedule.eventId?.name || schedule.module,
        };
      })
    );

    // Filter to only include schedules with evaluations
    const evaluatedSchedules = schedulesWithEvaluations.filter(schedule => schedule.evaluation);

    if (!evaluatedSchedules.length) {
      return res.status(400).json({ success: false, error: 'No evaluations found for this event' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `event_grade_report_${eventId}.pdf`;

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Event Grade Report', { align: 'center' });
    doc.moveDown();

    // Event details
    const eventName = evaluatedSchedules[0].eventId?.name || evaluatedSchedules[0].module;
    doc.fontSize(14).text('Event Details', { underline: true });
    doc.fontSize(12).text(`Event Name: ${eventName}`);
    doc.text(`Module: ${evaluatedSchedules[0].module}`);
    doc.moveDown();

    // Student evaluations
    doc.fontSize(14).text('Student Evaluations', { underline: true });
    evaluatedSchedules.forEach((schedule, index) => {
      doc.moveDown();
      doc.fontSize(12).text(`Student ${index + 1}:`, { underline: true });
      doc.text(`Name: ${schedule.studentId?.name || 'Unknown'}`);
      doc.text(`Email: ${schedule.studentId?.email || 'Unknown'}`);
      doc.text(`Grade: ${schedule.evaluation?.grade || 'N/A'}`);
      if (schedule.evaluation?.presentation) {
        doc.text('Presentation Notes:', { continued: true });
        doc.moveDown(0.5);
        doc.text(schedule.evaluation.presentation, { indent: 20 });
      } else {
        doc.text('Presentation Notes: None');
      }
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating event grade report:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};