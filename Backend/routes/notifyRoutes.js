const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const notifyController = require('../controllers/notifyController');

router.post('/send', authMiddleware, notifyController.sendNotification);
router.get('/status/:eventId', authMiddleware, notifyController.getNotificationStatuses);

module.exports = router;