const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/build", (req, res) => {
  const { idea, affiliate } = req.body;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${idea}</title>
    <style>
      body {
        font-family: Arial;
        background:#0f172a;
        color:white;
        text-align:center;
        padding:40px;
      }
      h1 { font-size:42px; }
      p { color:#94a3b8; }
      .btn {
        background:#22c55e;
        padding:15px 30px;
        border-radius:10px;
        color:white;
        text-decoration:none;
        display:inline-block;
        margin-top:20px;
      }
    </style>
  </head>
  <body>
    <h1>${idea}</h1>
    <p>This page was built with GenesisAI</p>

    <a class="btn" href="${affiliate || "#"}">Start Now</a>
  </body>
  </html>
  `;

  const fileName = "page.html";
  fs.writeFileSync(fileName, html);

  res.send(`
    <h2>Page Created</h2>
    <a href="/${fileName}" target="_blank">View Page</a><br><br>
    <a href="/${fileName}" download>Download Page</a>
  `);
});

app.listen(3000, () => console.log("Running on 3000"));
