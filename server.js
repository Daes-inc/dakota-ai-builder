const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 AI GENERATOR FUNCTION
function generateSite(prompt) {
  const niche = prompt.toLowerCase();

  let headline = `Best ${prompt} Online`;
  let sub = `Discover the top ${prompt} tools, apps, and platforms that actually work.`;
  let cta = "Get Started";

  if (niche.includes("fitness")) {
    headline = "Transform Your Body Fast";
    sub = "Top fitness programs, supplements, and tools that deliver real results.";
    cta = "Start Your Transformation";
  }

  if (niche.includes("money") || niche.includes("make money")) {
    headline = "Make Money Online Today";
    sub = "Discover real platforms and tools that help you earn consistently.";
    cta = "Start Earning";
  }

  if (niche.includes("ai")) {
    headline = "Best AI Tools Right Now";
    sub = "Boost productivity and income using the latest AI platforms.";
    cta = "Explore AI Tools";
  }

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${headline}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  margin: 0;
  font-family: Arial;
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
.btn {
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
  <h1>${headline}</h1>
  <p>${sub}</p>
  <a class="btn" href="#">${cta}</a>
</div>

<div class="section">
  <div class="card">Top Rated Tools</div>
  <div class="card">Proven Results</div>
  <div class="card">Easy To Start</div>
</div>

<div class="section">
  <div class="card">Trusted by Thousands</div>
  <div class="card">Fast Setup</div>
  <div class="card">High Converting Offers</div>
</div>

</body>
</html>
`;
}

// 🔥 BUILD ROUTE
app.post("/build", (req, res) => {
  const prompt = req.body.prompt || "AI Website";

  const html = generateSite(prompt);

  res.setHeader("Content-Disposition", "attachment; filename=site.html");
  res.setHeader("Content-Type", "text/html");

  res.send(html);
});

app.listen(PORT, () => {
  console.log("AI Builder running on port " + PORT);
});
