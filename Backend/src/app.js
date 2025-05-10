import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("LifeBuddy Backend API is running 🚀");
});

export default app;
