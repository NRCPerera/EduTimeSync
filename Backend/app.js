const express = require("express");
const connectDB = require("./db/connect");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const scheduleRoutes = require("./routes/userRoutes");

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/schedule", scheduleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
