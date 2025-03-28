const express = require('express');
const { submitExaminerAvailability } = require('../controllers/ExaminerAvailabilityController'); 
const router = express.Router();

router.post('/availability', submitExaminerAvailability);

module.exports = router;