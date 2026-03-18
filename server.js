const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/build", (req, res) => {
  console.log("BUILD HIT");

  try {
    const prompt = req.body.prompt || "Default Page";

    const response = {
      success: true,
      prompt: prompt,
      previewHtml: `
        <div style="padding:20px;">
          <h1>${prompt}</h1>
          <p>System working.</p>
        </div>
      `
    };

    res.json(response);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("RUNNING ON " + PORT);
});
