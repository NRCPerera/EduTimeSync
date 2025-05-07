const express = require('express');
const { submitExaminerAvailability, getExaminersAvailability } = require('../controllers/ExaminerAvailabilityController'); 
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming you have an auth middleware for authentication

router.post('/availability', auth, submitExaminerAvailability);
router.get('/get-examiners-availability', auth, getExaminersAvailability);

module.exports = router;