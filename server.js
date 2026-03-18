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

// 🔥 VIP USERS (UNLIMITED FREE ACCESS)
const VIP_USERS = [
  "127.0.0.1",
  "::1",
  "166.181.251.19" // YOUR IP ADDED
];

// Check VIP
function isVIP(ip) {
  return VIP_USERS.includes(ip);
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function generateProject(prompt, affiliateLinkInput) {
  const projectName = slugify(prompt);

  let affiliateLink = affiliateLinkInput;

  if (!affiliateLink || affiliateLink.trim() === "") {
    affiliateLink = "https://google.com";
  }

  if (!affiliateLink.startsWith("http")) {
    affiliateLink = "https://" + affiliateLink;
  }

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

    <a class="btn" href="${affiliateLink}" target="_blank" rel="noopener noreferrer">
      🔥 Get This Offer Now
    </a>

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

// BUILD
app.post("/build", (req, res) => {
  const ip = req.ip;
  usage[ip] = usage[ip] || 0;

  // 🔥 VIP BYPASS
  if (!isVIP(ip)) {
    if (usage[ip] >= 2) {
      return res.json({
        success: false,
        error: "Upgrade required",
        upgrade: true
      });
    }
  }

  usage[ip]++;
  analytics.builds++;

  const prompt = req.body.prompt || "AI site";
  const affiliateLink = req.body.affiliateLink;

  res.json(generateProject(prompt, affiliateLink));
});

// UPGRADE
app.post("/upgrade", (req, res) => {
  analytics.upgradeClicks++;

  res.json({
    success: true,
    link: "https://buy.stripe.com/YOUR_REAL_LINK"
  });
});

// SAVE
app.post("/save-project", (req, res) => {
  savedProjects.push(req.body);
  analytics.saves++;
  res.json({ success: true });
});

// PROJECTS
app.get("/projects", (req, res) => {
  res.json({ items: savedProjects });
});

// ANALYTICS
app.get("/analytics", (req, res) => {
  res.json({ analytics });
});

// DOWNLOAD
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

// DEPLOY
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
  console.log("🔥 VIP MONEY SYSTEM LIVE ON PORT " + PORT);
});
