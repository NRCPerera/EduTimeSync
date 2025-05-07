const express = require('express');
const router = express.Router();
const {
  signIn,
  signUp,
  getCurrentUser,
  getLicsAndExaminers,
  updateUser,
  deleteUser,
  getStudentRegistrations,
  generateUsersPDF,
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/signin', signIn);
router.post('/signup', signUp);
router.get('/me', auth, getCurrentUser);
router.get('/lics-examiners', auth, getLicsAndExaminers);
router.put('/user/:id', auth, updateUser);
router.delete('/user/:id', auth, deleteUser);
router.get('/student-registrations', auth, getStudentRegistrations);
router.get('/generate-pdf/:role', auth, generateUsersPDF);

module.exports = router;