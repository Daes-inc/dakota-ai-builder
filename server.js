import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let usage = {};

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    app: "Dakota AI Builder"
  });
});

app.get("/check-env", (req, res) => {
  res.json({
    hasNetlifyToken: !!process.env.NETLIFY_TOKEN
  });
});

app.post("/build", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";

  usage[ip] = usage[ip] || 0;

  if (usage[ip] >= 3) {
    return res.json({
      error: "Free limit reached. Upgrade required.",
      upgrade: "/upgrade"
    });
  }

  usage[ip]++;

  const prompt = (req.body?.prompt || "My Website").trim();

  const project = {
    projectName: prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    files: {
      "index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${prompt}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
      margin: 0;
      background: #0f172a;
      color: white;
    }
    .card {
      max-width: 700px;
      margin: 0 auto;
      background: #1e293b;
      padding: 30px;
      border-radius: 16px;
    }
    button {
      padding: 12px 20px;
      margin-top: 20px;
      border: none;
      border-radius: 10px;
      background: #22c55e;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${prompt}</h1>
    <p>This site was generated instantly by Dakota AI Builder.</p>
    <button onclick="alert('CTA clicked')">Get Started</button>
  </div>
</body>
</html>`
    }
  };

  res.json(project);
});

app.post("/deploy", async (req, res) => {
  try {
    const files = req.body?.files;
    const token = process.env.NETLIFY_TOKEN;

    if (!token) {
      return res.json({ error: "Missing NETLIFY_TOKEN" });
    }

    if (!files || !files["index.html"]) {
      return res.json({ error: "Missing generated files" });
    }

    const siteRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "ai-site-" + Date.now()
      })
    });

    const site = await siteRes.json();

    if (!siteRes.ok || !site.id) {
      return res.json({
        error: "Failed creating Netlify site",
        details: site
      });
    }

    const deployRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${site.id}/deploys`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files: {
            "index.html": files["index.html"]
          }
        })
      }
    );

    const deploy = await deployRes.json();

    if (!deployRes.ok) {
      return res.json({
        error: "Failed deploying to Netlify",
        details: deploy
      });
    }

    res.json({
      status: "deployed",
      url: deploy.deploy_ssl_url || deploy.ssl_url || deploy.url || null
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

app.post("/upgrade", (req, res) => {
  res.json({
    checkout: "https://buy.stripe.com/test_yourlink"
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
