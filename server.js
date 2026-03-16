import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dakota AI Builder is running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    system: "Dakota AI Builder",
    version: "1.0"
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
