const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dakota AI Builder is running");
});

app.get("/run", (req, res) => {
  const command = req.query.command;

  if (!command) {
    return res.json({
      status: "error",
      message: "No command provided"
    });
  }

  console.log("Command received:", command);

  res.json({
    status: "success",
    command: command
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
