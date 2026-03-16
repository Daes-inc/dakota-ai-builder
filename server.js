const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dakota AI Builder is running");
});

app.post("/run", (req, res) => {

  const command = req.body.command;

  console.log("Command received:", command);

  res.json({
    status: "command received",
    command: command
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
