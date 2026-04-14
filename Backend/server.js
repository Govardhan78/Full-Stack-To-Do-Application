const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Health check — confirms API is live
app.get('/', (req, res) => res.json({ status: 'ok', message: 'TaskFlow API is running' }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
