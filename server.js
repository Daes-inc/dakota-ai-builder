const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let usage = {};

app.get('/health', (req, res) => {
  res.json({ status: "online" });
});

app.get('/check-env', (req, res) => {
  res.json({
    hasNetlifyToken: !!process.env.NETLIFY_TOKEN
  });
});

app.post('/build', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  usage[ip] = usage[ip] || 0;

  if (usage[ip] >= 3) {
    return res.json({
      error: "Free limit reached",
      upgrade: "/upgrade"
    });
  }

  usage[ip]++;

  const prompt = req.body.prompt || "My Website";

  res.json({
    projectName: prompt.replace(/\s+/g, '-'),
    files: {
      "index.html": `
<!DOCTYPE html>
<html>
<head>
<title>${prompt}</title>
<style>
body {
  font-family: Arial;
  background: #0f172a;
  color: white;
  text-align: center;
  padding: 40px;
}
h1 { font-size: 48px; }
p { opacity: 0.8; }
button {
  background: #22c55e;
  border: none;
  padding: 15px 25px;
  font-size: 18px;
  border-radius: 10px;
  cursor: pointer;
}
</style>
</head>

<body>

<h1>${prompt}</h1>
<p>High converting landing page</p>

<button onclick="alert('Upgrade required for premium features')">
Start Now
</button>

</body>
</html>
      `
    }
  });
});

app.post('/deploy', async (req, res) => {
  try {
    const token = process.env.NETLIFY_TOKEN;
    const files = req.body.files;

    if (!token) {
      return res.json({ error: "Missing token" });
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

app.post('/upgrade', (req, res) => {
  res.json({
    message: "Upgrade to unlimited builds",
    link: "https://buy.stripe.com/test_yourlink"
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
