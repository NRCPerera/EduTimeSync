const connectDB = require('./db/connect');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes'); // Assuming this exists
const cors = require('cors');
const express = require("express");
const connectDB = require("./db/connect");
const dotenv = require("dotenv");
const scheduleRoutes = require("./routes/scheduleRoute");
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors'); // Add this line

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/schedule', scheduleRoutes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));