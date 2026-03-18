const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIG =====
const STRIPE_LINK = "https://buy.stripe.com/eVq5kD2Gh0aH6ZW8fP5sA00";

// VIPs get unlimited free use
const VIP_USERS = [
  "127.0.0.1",
  "::1",
  "166.181.251.19",
  "::ffff:166.181.251.19"
];

// ===== APP SETUP =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// simple in-memory usage store
// key = ip, value = count
const usage = Object.create(null);

function isVIP(ip) {
  return VIP_USERS.includes(ip);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function slugify(text) {
  return String(text || "page")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "page";
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeAffiliateLink(link) {
  let out = String(link || "").trim();

  if (!out) return "#";
  if (!/^https?:\/\//i.test(out)) {
    out = "https://" + out;
  }
  return out;
}

function buildPageHtml(idea, affiliate) {
  const safeIdea = escapeHtml(idea);
  const safeAffiliate = normalizeAffiliateLink(affiliate);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeIdea} | GenesisAI AutoBuilder</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: white;
      text-align: center;
      padding: 40px 20px;
    }
    .wrap {
      max-width: 900px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      background: #1e293b;
      color: #86efac;
      padding: 10px 16px;
      border-radius: 999px;
      font-weight: bold;
      margin-bottom: 18px;
    }
    h1 {
      font-size: 44px;
      margin: 0 0 12px;
    }
    p {
      color: #cbd5e1;
      font-size: 18px;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .btn {
      display: inline-block;
      background: #22c55e;
      color: white;
      text-decoration: none;
      font-weight: bold;
      padding: 15px 28px;
      border-radius: 10px;
      margin-top: 12px;
    }
    .grid {
      margin-top: 40px;
      display: grid;
      gap: 16px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }
    .card {
      background: #1e293b;
      padding: 20px;
      border-radius: 14px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="badge">GenesisAI AutoBuilder</div>
    <h1>${safeIdea}</h1>
    <p>Built with GenesisAI — Build. Launch. Profit.</p>
    <a class="btn" href="${safeAffiliate}" target="_blank" rel="noopener noreferrer">Start Now</a>
  </div>

  <div class="grid">
    <div class="card">Simple landing-page structure</div>
    <div class="card">Fast affiliate or product promotion</div>
    <div class="card">Built automatically with GenesisAI</div>
  </div>
</body>
</html>`;
}

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/health", (req, res) => {
  const ip = getClientIp(req);
  const count = usage[ip] || 0;
  const vip = isVIP(ip);

  res.json({
    status: "online",
    app: "GenesisAI AutoBuilder",
    ip,
    vip,
    freeBuildsUsed: vip ? 0 : count,
    freeBuildsRemaining: vip ? "unlimited" : Math.max(0, 2 - count)
  });
});

app.get("/usage", (req, res) => {
  const ip = getClientIp(req);
  const count = usage[ip] || 0;
  const vip = isVIP(ip);

  res.json({
    success: true,
    vip,
    used: vip ? 0 : count,
    remaining: vip ? 9999 : Math.max(0, 2 - count),
    limitReached: vip ? false : count >= 2,
    stripeLink: STRIPE_LINK
  });
});

app.post("/build", (req, res) => {
  const ip = getClientIp(req);
  const vip = isVIP(ip);

  if (!vip) {
    usage[ip] = usage[ip] || 0;

    if (usage[ip] >= 2) {
      return res.status(403).json({
        success: false,
        error: "Free limit reached",
        message: "You’ve used your 2 free builds.",
        upgradeRequired: true,
        stripeLink: STRIPE_LINK,
        remaining: 0
      });
    }

    usage[ip] += 1;
  }

  const idea = String(req.body.idea || "My Offer").trim();
  const affiliate = req.body.affiliate || "";

  const html = buildPageHtml(idea, affiliate);
  const fileName = slugify(idea) + ".html";
  const filePath = path.join(__dirname, "public", "generated-" + fileName);

  fs.writeFileSync(filePath, html, "utf8");

  const count = usage[ip] || 0;

  res.json({
    success: true,
    vip,
    fileUrl: "/generated-" + fileName,
    remaining: vip ? 9999 : Math.max(0, 2 - count),
    message: vip ? "VIP build created" : "Build created"
  });
});

app.listen(PORT, () => {
  console.log("GenesisAI lock system live on port " + PORT);
});
