const express = require("express");
const  schedulePresentation  = require("../controllers/scheduleController");

const router = express.Router();
// router.post("/", schedulePresentation);
router.get("/student", schedulePresentation.getStudentSchedules);
//router.post("/schedule/add", schedulePresentation.createSchedule);
router.get("/examiner", schedulePresentation.getExaminerSchedules);

module.exports = router;