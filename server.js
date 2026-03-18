const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// ===== SIMPLE MEMORY LIMIT SYSTEM =====
let usage = {};

// ===== SERVE FRONTEND =====
app.use(express.static('public'));

// ===== BUILD ROUTE =====
app.post('/build', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  usage[ip] = usage[ip] || 0;

  if (usage[ip] >= 3) {
    return res.json({
      error: "Free limit reached. Upgrade required.",
      upgrade: "/upgrade"
    });
  }

  usage[ip]++;

  const prompt = req.body.prompt || "My Website";

  const project = {
    projectName: prompt.replace(/\s+/g, '-'),
    files: {
      "index.html": `
<!DOCTYPE html>
<html>
<head>
<title>${prompt}</title>
<style>
body { font-family: Arial; text-align: center; padding: 50px; }
button { padding: 10px 20px; margin-top: 20px; }
</style>
</head>
<body>

<h1>${prompt}</h1>
<p>This site was generated instantly 🚀</p>
<button onclick="alert('CTA Clicked')">Get Started</button>

</body>
</html>
      `
    }
  };

  res.json(project);
});

// ===== DEPLOY ROUTE =====
app.post('/deploy', async (req, res) => {
  try {
    const files = req.body.files;
    const token = process.env.NETLIFY_TOKEN;

    if (!token) {
      return res.json({ error: "Missing NETLIFY_TOKEN" });
    }

    // CREATE SITE
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

    // DEPLOY FILES
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

    res.json({
      url: deploy.deploy_ssl_url
    });

  } catch (err) {
    res.json({ error: err.message });
  }
});

// ===== UPGRADE ROUTE =====
app.post('/upgrade', (req, res) => {
  res.json({
    checkout: "https://buy.stripe.com/test_yourlink"
  });
});

// ===== ENV TEST ROUTE =====
app.get('/check-env', (req, res) => {
  res.json({
    hasNetlifyToken: !!process.env.NETLIFY_TOKEN
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
