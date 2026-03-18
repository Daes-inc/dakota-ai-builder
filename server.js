const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const usage = {};
const savedProjects = [];
const analytics = {
  builds: 0,
  deploys: 0,
  downloads: 0,
  saves: 0,
  upgradeClicks: 0
};

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function generateProject(prompt, affiliateLink) {
  const projectName = slugify(prompt);

  const html = `
  <html>
  <head>
    <title>${prompt}</title>
    <style>
      body { font-family: Arial; background:#0f172a; color:white; text-align:center; padding:40px;}
      .btn { background:#22c55e; padding:14px 20px; border-radius:10px; color:white; text-decoration:none; display:inline-block; margin-top:20px;}
    </style>
  </head>
  <body>
    <h1>${prompt}</h1>
    <p>High converting landing page</p>
    <a class="btn" href="${affiliateLink}" target="_blank">🔥 Get This Offer Now</a>
  </body>
  </html>
  `;

  return {
    success: true,
    projectName,
    previewHtml: html,
    files: {
      "index.html": html
    }
  };
}

app.post("/build", (req, res) => {
  const ip = req.ip;
  usage[ip] = usage[ip] || 0;

  if (usage[ip] >= 2) {
    return res.json({
      success: false,
      error: "Upgrade required",
      upgrade: true
    });
  }

  usage[ip]++;
  analytics.builds++;

  const prompt = req.body.prompt || "AI site";
  const affiliateLink = req.body.affiliateLink || "https://YOUR_AFFILIATE_LINK";

  res.json(generateProject(prompt, affiliateLink));
});

app.post("/upgrade", (req, res) => {
  analytics.upgradeClicks++;

  res.json({
    success: true,
    link: "https://buy.stripe.com/YOUR_REAL_LINK"
  });
});

app.post("/save-project", (req, res) => {
  savedProjects.push(req.body);
  analytics.saves++;
  res.json({ success: true });
});

app.get("/projects", (req, res) => {
  res.json({ items: savedProjects });
});

app.get("/analytics", (req, res) => {
  res.json({ analytics });
});

app.post("/download", (req, res) => {
  const archive = archiver("zip");
  res.attachment("site.zip");
  archive.pipe(res);

  const files = req.body.files;

  Object.keys(files).forEach(name => {
    archive.append(files[name], { name });
  });

  archive.finalize();
});

app.post("/deploy", async (req, res) => {
  const token = process.env.NETLIFY_TOKEN;

  const archive = archiver("zip");
  const chunks = [];

  archive.on("data", chunk => chunks.push(chunk));
  archive.on("end", async () => {
    const zipBuffer = Buffer.concat(chunks);

    const netlifyRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/zip"
      },
      body: zipBuffer
    });

    const data = await netlifyRes.json();

    analytics.deploys++;

    res.json({
      success: true,
      url: data.ssl_url
    });
  });

  Object.keys(req.body.files).forEach(name => {
    archive.append(req.body.files[name], { name });
  });

  archive.finalize();
});

app.listen(PORT, () => {
  console.log("MONEY SYSTEM LIVE " + PORT);
});
