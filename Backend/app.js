const connectDB = require('./db/connect');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const express = require("express");
const scheduleRoutes = require("./routes/scheduleRoute");
const errorHandler = require('./middleware/errorHandler');
const ExaminerAvailabilityRoutes = require('./routes/ExamineravailabilityRoute');
const assignedEventRoutes = require('./routes/AssignedEventsRoute');
const evaluationRoutes = require('./routes/EvaluationRoutes');
const eventRoutes = require('./routes/EventRoutes');
const filterexaminerRoutes = require('./routes/FilterAvailabilityRoutes');
const rescheduleRequestRoutes = require("./routes/rescheduleRequestRoute");
const moduleRoutes = require("./routes/moduleRoute");

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/users', userRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/examiner', ExaminerAvailabilityRoutes);
app.use('/api/assigned', assignedEventRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api', eventRoutes);
app.use('/api', filterexaminerRoutes);
app.use('/api/reschedule', rescheduleRequestRoutes);
app.use('/api/modules', moduleRoutes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));