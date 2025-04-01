const express = require('express');
const { submitExaminerAvailability } = require('../controllers/ExaminerAvailabilityController'); 
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming you have an auth middleware for authentication

router.post('/availability', auth, submitExaminerAvailability);

module.exports = router;