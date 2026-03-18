const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ status: "online", app: "Dakota AI Builder" });
});

app.post("/build", (req, res) => {
  const prompt = (req.body.prompt || "Landing Page").trim();

  const page = `
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
      padding: 70px 20px 40px;
    }
    .hero h1 {
      font-size: 42px;
      margin-bottom: 10px;
    }
    .hero p {
      color: #cbd5e1;
      font-size: 18px;
      max-width: 700px;
      margin: 0 auto 24px;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background: #22c55e;
      color: white;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 10px;
      font-weight: bold;
    }
    .section {
      padding: 30px 20px;
    }
    .grid {
      display: grid;
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }
    .card {
      background: #1e293b;
      border-radius: 14px;
      padding: 20px;
    }
    .topbar {
      padding: 16px;
      background: #020617;
    }
    .topbar a {
      color: #86efac;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <a href="/">← Back to Dakota AI Builder</a>
  </div>

  <section class="hero">
    <h1>${prompt}</h1>
    <p>This is your generated landing page preview. The system is now working through direct server rendering.</p>
    <a class="btn" href="/">Build Another</a>
  </section>

  <section class="section">
    <div class="grid">
      <div class="card">High-conversion structure</div>
      <div class="card">Simple, stable, direct build flow</div>
      <div class="card">Ready for premium upgrades next</div>
    </div>
  </section>

  <section class="section">
    <div class="grid">
      <div class="card">Testimonial: “This finally works.”</div>
      <div class="card">Offer: Starter / Pro / Elite</div>
      <div class="card">CTA: Deploy and monetize next</div>
    </div>
  </section>
</body>
</html>
  `;

  res.send(page);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
