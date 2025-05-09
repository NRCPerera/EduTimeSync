const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');

router.get('/get-events', eventController.getEvents);
router.get('/get-examiners', eventController.getExaminers);
router.post('/set-events', eventController.createEvent);
router.put('/update-events/:id', eventController.updateEvent);
router.delete('/delete-events/:id', eventController.deleteEvent);
router.get('/generate-report/:eventId?', eventController.generateEventReport);

module.exports = router;