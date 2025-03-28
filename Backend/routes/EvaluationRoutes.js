const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/EvaluationController');

router.get('/students', evaluationController.getStudentsForEvaluation);
router.post('/submit', evaluationController.submitEvaluations);

module.exports = router;