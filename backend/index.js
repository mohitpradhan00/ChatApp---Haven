import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import http from "http";
import path from "path";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoute.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import { setupSocket } from "./socket.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;
const databaseURL = process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.ORIGIN.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(databaseURL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
connectDB();

/* serve react frontend */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist", "index.html"));
});

/* app.get("/", (req, res) => {
  res.send("Backend is running!");
});
 */
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
