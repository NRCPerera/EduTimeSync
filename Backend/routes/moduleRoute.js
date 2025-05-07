const express = require('express');
const router = express.Router();
const { registerModule, createModule, getAllModules, deleteModule } = require('../controllers/moduleController');
const auth = require('../middleware/auth');

router.post('/register', auth, registerModule);
router.post('/create', auth, createModule);
router.get('/all', auth, getAllModules);
router.delete('/:id', auth, deleteModule);

module.exports = router;