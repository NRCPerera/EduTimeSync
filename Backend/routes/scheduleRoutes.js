const express = require("express");
const { schedulePresentation } = require("../controllers/scheduleController");

const router = express.Router();
router.post("/schedule", schedulePresentation);

module.exports = router;
