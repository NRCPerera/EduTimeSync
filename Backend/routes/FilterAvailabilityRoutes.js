const express = require('express');
const router = express.Router();
const examinerController = require('../controllers/FilterAvailabilityController');

router.get('/get-examiners-availability', examinerController.getExaminersAvailability);
router.post('/notify', examinerController.sendNotification);

module.exports = router;