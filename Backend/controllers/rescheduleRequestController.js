const RescheduleRequest = require('../models/RescheduleRequest');
const Schedule = require('../models/Schedule');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');


// Validation middleware
// exports.validateRescheduleRequest = [
//   check('scheduleId', 'Schedule ID is required').not().isEmpty(),
//   check('proposedTime.date', 'Proposed date is required').not().isEmpty(),
//   check('proposedTime.startTime', 'Proposed start time is required').not().isEmpty(),
//   check('proposedTime.endTime', 'Proposed end time is required').not().isEmpty(),
//   check('reason', 'Reason for rescheduling is required').not().isEmpty(),
// ];

// Create a reschedule request (Examiner only)
exports.createRescheduleRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { scheduleId, proposedTime, reason } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    if (schedule.examinerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to reschedule this exam' });
    }
    if (!schedule.studentId) {
      return res.status(400).json({ success: false, error: 'Schedule missing studentId' });
    }

    const existingRequest = await RescheduleRequest.findOne({ scheduleId, examinerId: req.user.id });
    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'A reschedule request already exists for this schedule' });
    }

    const request = await RescheduleRequest.create({
      scheduleId,
      examinerId: req.user.id,
      studentId: schedule.studentId,
      currentScheduleTime: {
        date: schedule.startTime.toISOString().split('T')[0],
        startTime: schedule.startTime.toTimeString().slice(0, 5),
        endTime: schedule.endTime.toTimeString().slice(0, 5),
      },
      proposedTime,
      reason,
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Create reschedule request error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Get all reschedule requests (LIC only)
exports.getAllRescheduleRequests = async (req, res) => {
  try {
    if (req.user.role !== 'LIC') {
      return res.status(403).json({ success: false, error: 'Access denied. LIC only.' });
    }
    const requests = await RescheduleRequest.find()
      .populate('examinerId', 'email name')
      .populate('studentId', 'email name')
      .populate('scheduleId', 'module startTime endTime');

    // Log requests for debugging
    console.log('Fetched reschedule requests:', JSON.stringify(requests, null, 2));

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get reschedule requests error:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching reschedule requests' });
  }
};

// Update reschedule request status (LIC only)
exports.updateRescheduleRequest = async (req, res) => {
  try {
    if (req.user.role !== 'LIC') {
      return res.status(403).json({ success: false, error: 'Access denied. LIC only.' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be "approved" or "rejected"' });
    }

    const request = await RescheduleRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Reschedule request not found' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Update reschedule request error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// Get examiner's reschedule requests
exports.getExaminerRescheduleRequests = async (req, res) => {
  try {
    const requests = await RescheduleRequest.find({ examinerId: req.user.id })
      .populate('scheduleId', 'module googleMeetLink')
      .populate('studentId', 'email name');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get examiner reschedule requests error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

exports.deleteRescheduleRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if the reschedule request exists
    const request = await RescheduleRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Reschedule request not found'
      });
    }

    // Verify the user is authorized (examiner who owns the request)
    if (request.examinerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this reschedule request'
      });
    }

    // Delete the reschedule request
    await RescheduleRequest.findByIdAndDelete(requestId);

    res.status(200).json({
      success: true,
      message: 'Reschedule request deleted successfully'
    });
  } catch (error) {
    console.error('Delete reschedule request error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

exports.getMonthlyRescheduleRequests = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validate inputs
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month or year'
      });
    }

    // Calculate date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const requests = await RescheduleRequest.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('scheduleId', 'module googleMeetLink')
      .populate('studentId', 'email name')
      .populate('examinerId', 'email name');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get monthly reschedule requests error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

// Generate and download monthly report as PDF using pdfkit
exports.generateMonthlyReportPDF = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validate inputs
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month or year'
      });
    }

    // Fetch reschedule requests
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const requests = await RescheduleRequest.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('scheduleId', 'module googleMeetLink')
      .populate('studentId', 'email name')
      .populate('examinerId', 'email name');

    // Create temporary directory and file
    const tempDir = path.join(__dirname, '../temp');
    await fsPromises.mkdir(tempDir, { recursive: true });
    const fileName = `report_${monthNum}_${yearNum}_${Date.now()}`;
    const pdfFilePath = path.join(tempDir, `${fileName}.pdf`);

    // Initialize PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Pipe PDF to file
    const stream = doc.pipe(fs.createWriteStream(pdfFilePath));

    // Add content to PDF
    const monthName = new Date(yearNum, monthNum - 1).toLocaleString('default', { month: 'long' });

    // Title
    doc.fontSize(20).font('Helvetica-Bold')
       .text(`Reschedule Requests Report - ${monthName} ${yearNum}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).font('Helvetica')
       .text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
       .text(`This report contains details of all reschedule requests for examinations submitted in ${monthName} ${yearNum}.`);
    doc.text(`Total Requests: ${requests.length}`);
    doc.moveDown(2);

    // Requests Section
    doc.fontSize(14).font('Helvetica')
       .text('Reschedule Requests', { underline: true });
    doc.moveDown(1);

    // Table Header
    const tableTop = doc.y;
    const columnWidth = 80;
    const headers = ['Module', 'Examiner', 'Student', 'Proposed Date', 'Proposed Time', 'Status', 'Reason'];
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, 50 + i * columnWidth, tableTop, { width: columnWidth, align: 'left' });
    });

    // Table Separator
    doc.moveTo(50, tableTop + 15)
       .lineTo(50 + 7 * columnWidth, tableTop + 15)
       .stroke();
    doc.moveDown(1);

    // Table Rows
    doc.fontSize(10).font('Helvetica');
    requests.forEach((request, index) => {
      const y = doc.y;
      const proposedDate = request.proposedTime?.date
        ? new Date(request.proposedTime.date).toLocaleDateString()
        : 'N/A';
      const proposedTime = request.proposedTime?.startTime && request.proposedTime?.endTime
        ? `${request.proposedTime.startTime} - ${request.proposedTime.endTime}`
        : 'N/A';
      const rowData = [
        request.scheduleId?.module || 'N/A',
        `${request.examinerId?.name || 'N/A'}`,
        `${request.studentId?.name || 'N/A'}`,
        proposedDate,
        proposedTime,
        request.status.charAt(0).toUpperCase() + request.status.slice(1),
        request.reason || 'No reason provided'
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, 50 + i * columnWidth, y, { width: columnWidth, align: 'left', lineBreak: true });
      });

      // Move to next row
      const maxHeight = Math.max(...rowData.map(cell => doc.heightOfString(cell, { width: columnWidth })));
      doc.y = y + maxHeight + 5;

      // Draw row separator
      doc.moveTo(50, y + maxHeight + 5)
         .lineTo(50 + 7 * columnWidth, y + maxHeight + 5)
         .stroke();

      // Add page break if nearing bottom
      if (doc.y > 700 && index < requests.length - 1) {
        doc.addPage();
        doc.y = 50;
      }
    });

    // Finalize PDF
    doc.end();

    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Read the generated PDF
    const pdfBuffer = await fsPromises.readFile(pdfFilePath);

    // Clean up temporary file
    await fsPromises.unlink(pdfFilePath).catch(err => console.error('Error deleting temp PDF:', err));

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Reschedule_Requests_${monthName}_${yearNum}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Generate PDF report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};