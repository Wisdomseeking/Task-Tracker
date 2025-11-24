import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config(); // Load .env variables

const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(cookieParser());

// CORS (allow cookies + frontend)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ---------- ROUTES ----------
app.use("/tasks", taskRoutes);
app.use("/auth", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
