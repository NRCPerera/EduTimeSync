const express = require("express");
const  schedulePresentation  = require("../controllers/scheduleController");
const auth = require('../middleware/auth'); 

const router = express.Router();
// router.post("/", schedulePresentation);
router.get("/student", auth, schedulePresentation.getStudentSchedules);
//router.post("/schedule/add", schedulePresentation.createSchedule);
router.get("/examiner", auth, schedulePresentation.getExaminerSchedules);
router.post("/add", schedulePresentation.createSchedule);

module.exports = router;