const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dakota AI Builder is running");
});

app.post("/run", async (req, res) => {
  try {
    const command = req.body.command;

    if (!command) {
      return res.status(400).json({
        status: "error",
        message: "No command provided"
      });
    }

    console.log("Command received:", command);

    let result = "";

    if (command.toLowerCase().includes("landing page")) {
      result = "Build plan created for a landing page.";
    } else if (command.toLowerCase().includes("affiliate")) {
      result = "Build plan created for an affiliate website.";
    } else if (command.toLowerCase().includes("app")) {
      result = "Build plan created for an app project.";
    } else {
      result = `Command understood: ${command}`;
    }

    res.json({
      status: "success",
      command,
      result
    });
  } catch (error) {
    console.error("Run error:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
