const express = require("express");
const  schedulePresentation  = require("../controllers/scheduleController");
const auth = require('../middleware/auth'); 

const router = express.Router();

router.get("/student", auth, schedulePresentation.getStudentSchedules);
router.post("/add/:eventId", auth, schedulePresentation.scheduleEvent);
router.get("/examiner", auth, schedulePresentation.getExaminerSchedules);
router.put("/update/:scheduleId", auth, schedulePresentation.rescheduleExam);

module.exports = router;