const express = require('express');
const router = express.Router();
const examinerController = require('../controllers/FilterAvailabilityController');

router.get('/get-examiners-availability', examinerController.getExaminersAvailability);

module.exports = router;