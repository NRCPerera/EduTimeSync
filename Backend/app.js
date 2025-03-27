const express = require("express");
const connectDB = require("./db/connect");
const dotenv = require("dotenv");
const scheduleRoutes = require("./routes/scheduleRoute");
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors'); // Add this line

dotenv.config();
const app = express();
connectDB();

app.use(cors({
    origin: 'http://localhost:5173' // Adjust if your frontend port differs
  }));
app.use(express.json());
app.use("/api/schedule", scheduleRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
