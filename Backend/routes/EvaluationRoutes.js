const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const evaluationController = require('../controllers/EvaluationController');

router.get('/students', auth, evaluationController.getStudentsForEvaluation);
router.get('/studentgrades/:studentId', auth, evaluationController.getStudentEvaluation);
router.get('/schedule', auth, evaluationController.getScheduleEvaluation);
router.post('/submit', auth, evaluationController.submitEvaluations);
router.get('/report/event/:eventId', auth, evaluationController.generateEventGradeReport);

module.exports = router;