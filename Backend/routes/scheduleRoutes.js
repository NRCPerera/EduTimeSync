const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  createSchedule,
  getScheduleById,
  validateSchedule
} = require('../controllers/scheduleController');
const auth = require('../middleware/auth');

router.route('/')
  .get(auth, getAllSchedules)
  .post(auth, validateSchedule, createSchedule);

router.route('/:id')
  .get(auth, getScheduleById);

module.exports = router;