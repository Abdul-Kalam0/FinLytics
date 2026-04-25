import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import analyticsRoutes from "./routes/analytiscRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/", recordRoutes);

app.use("/", analyticsRoutes);

app.use("/", aiRoutes);

export default app;
