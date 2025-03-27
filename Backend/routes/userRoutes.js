const express = require('express');
const router = express.Router();
const { signIn, signUp, getCurrentUser } = require('../controllers/userController');
const auth = require('../middleware/auth'); 

// Sign In Route
router.post('/signin', signIn);

// Sign Up Route
router.post('/signup', signUp);

// Get Current User Route
router.get('/me', auth, getCurrentUser);

module.exports = router;