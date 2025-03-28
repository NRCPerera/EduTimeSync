const express = require('express');
const router = express.Router();
const {
  validateRescheduleRequest,
  createRescheduleRequest,
  getAllRescheduleRequests,
  updateRescheduleRequest,
} = require('../controllers/rescheduleRequestController');
const auth = require('../middleware/auth');

router.post('/add', auth, validateRescheduleRequest, createRescheduleRequest);
router.get('/all', auth, getAllRescheduleRequests);
router.put('/:id', auth, updateRescheduleRequest);
//router.get('/examiner', auth, getExaminerRescheduleRequests);

module.exports = router;