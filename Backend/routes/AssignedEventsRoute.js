const express = require('express');
const { getAssignedEvents } = require('../controllers/AssignedEventController');
const router = express.Router();

router.get('/events', getAssignedEvents);

module.exports = router;