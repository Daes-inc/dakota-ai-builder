const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "online" });
});

// 🔥 BUILD → DOWNLOAD REAL WEBSITE
app.post("/build", (req, res) => {
  const prompt = (req.body.prompt || "Landing Page").trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${prompt}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0f172a;
  color: white;
  text-align: center;
}
.hero {
  padding: 80px 20px 40px;
}
.hero h1 {
  font-size: 42px;
}
.hero p {
  color: #cbd5e1;
  max-width: 600px;
  margin: 0 auto 20px;
}
.button {
  display: inline-block;
  background: #22c55e;
  padding: 14px 24px;
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-weight: bold;
}
.section {
  padding: 30px 20px;
}
.card {
  background: #1e293b;
  margin: 10px auto;
  padding: 20px;
  border-radius: 12px;
  max-width: 500px;
}
</style>
</head>

<body>

<div class="hero">
  <h1>${prompt}</h1>
  <p>This website was generated instantly by Dakota AI Builder.</p>
  <a class="button" href="#">Get Started</a>
</div>

<div class="section">
  <div class="card">High converting layout</div>
  <div class="card">Fast deploy ready</div>
  <div class="card">Built for monetization</div>
</div>

</body>
</html>
`;

  res.setHeader("Content-Disposition", "attachment; filename=site.html");
  res.setHeader("Content-Type", "text/html");

  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log("🔥 Dakota AI Builder running on port " + PORT);
});
