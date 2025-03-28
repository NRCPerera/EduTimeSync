const express = require('express');
const router = express.Router();
const { signIn, signUp, getCurrentUser, getLicsAndExaminers, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth'); 

// Sign In Route
router.post('/signin', signIn);

// Sign Up Route
router.post('/signup', signUp);

// Get Current User Route
router.get('/me', auth, getCurrentUser);

// Get All LICs and Examiners (Admin only)
router.get('/lics-examiners', auth, getLicsAndExaminers);

// Update User (Admin only)
router.put('/user/:id', auth, updateUser);

// Delete User (Admin only)
router.delete('/user/:id', auth, deleteUser);

module.exports = router;