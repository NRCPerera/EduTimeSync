const express = require('express');
const router = express.Router();
const {
  createRescheduleRequest,
  getAllRescheduleRequests,
  updateRescheduleRequest,
  getExaminerRescheduleRequests,
  deleteRescheduleRequest,
  getMonthlyRescheduleRequests,
  generateMonthlyReportPDF,
} = require('../controllers/rescheduleRequestController');
const auth = require('../middleware/auth');

router.post('/add', auth, createRescheduleRequest);
router.get('/all', auth, getAllRescheduleRequests);
router.put('/:id', auth, updateRescheduleRequest);
router.get('/examiner', auth, getExaminerRescheduleRequests);
router.delete('/:id', auth, deleteRescheduleRequest);
router.get('/monthly', auth, getMonthlyRescheduleRequests);
router.get('/monthly/report/pdf', auth, generateMonthlyReportPDF);

module.exports = router;