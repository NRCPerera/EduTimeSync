const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const assignmentController = require('../controllers/assignmentController.js');

router.get('/examiner', authMiddleware, assignmentController.getExaminerAssignments);
router.post('/respond/:assignmentId', authMiddleware, assignmentController.respondToAssignment);

module.exports = router;