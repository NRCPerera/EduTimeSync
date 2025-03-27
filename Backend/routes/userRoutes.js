const express = require('express');
const router = express.Router();
const { signIn, signUp } = require('../controllers/userController');

// Sign In Route
router.post('/signin', signIn);

// Sign Up Route
router.post('/signup', signUp);

module.exports = router;