const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "2mb" }));
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
  return String(text || "my-site")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "my-site";
}

function titleCase(text) {
  return String(text || "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detectNiche(prompt) {
  const p = String(prompt || "").toLowerCase();

  if (p.includes("fitness") || p.includes("gym") || p.includes("workout")) {
    return {
      niche: "fitness",
      headline: "Build Your Best Body Faster",
      subheadline: "Simple system. Real results. No wasted time.",
      cta1: "Start Your Transformation",
      cta2: "See The Program",
      feature1: "Clear offer positioning for fitness products and coaching.",
      feature2: "Built to drive clicks, signups, and challenge opt-ins.",
      feature3: "Premium design that makes the offer feel credible.",
      testimonial1: "This feels like a real premium fitness brand.",
      testimonial2: "Strong CTA flow and clean conversion structure."
    };
  }

  if (p.includes("affiliate") || p.includes("review") || p.includes("offer") || p.includes("casino") || p.includes("sportsbook")) {
    return {
      niche: "affiliate",
      headline: "Top Recommended Offer Right Now",
      subheadline: "Compare, click, and get started in seconds.",
      cta1: "See The Offer",
      cta2: "Compare Options",
      feature1: "Affiliate-ready CTA structure and offer presentation.",
      feature2: "Simple trust-building layout that gets users to action.",
      feature3: "Built for reviews, comparisons, and click-through flow.",
      testimonial1: "Way cleaner than most affiliate landing pages.",
      testimonial2: "Fast, focused, and built to drive clicks."
    };
  }

  if (p.includes("ai") || p.includes("software") || p.includes("saas") || p.includes("app")) {
    return {
      niche: "saas",
      headline: "Launch Smarter With A Better Software Offer",
      subheadline: "Premium software-style landing page built to convert.",
      cta1: "Start Free",
      cta2: "Book A Demo",
      feature1: "SaaS-style structure with trust and clarity.",
      feature2: "Built for demos, signups, and waitlists.",
      feature3: "Clean product positioning with premium presentation.",
      testimonial1: "Looks like a real SaaS launch page.",
      testimonial2: "Strong product feel without the bloated mess."
    };
  }

  if (p.includes("roofer") || p.includes("roofing") || p.includes("plumber") || p.includes("hvac") || p.includes("contractor") || p.includes("local")) {
    return {
      niche: "local-business",
      headline: "Turn Local Traffic Into Real Jobs",
      subheadline: "Trust-building site structure made for leads and quote requests.",
      cta1: "Get A Free Quote",
      cta2: "Call Now",
      feature1: "Built for local trust, forms, and phone calls.",
      feature2: "Simple service layout that feels credible fast.",
      feature3: "Lead-focused structure that gets people moving.",
      testimonial1: "This looks like a business people would actually hire.",
      testimonial2: "Strong local service feel and easy call-to-action."
    };
  }

  return {
    niche: "general",
    headline: `Best ${titleCase(prompt)} Online`,
    subheadline: `Discover the top ${prompt} tools, offers, and platforms that actually work.`,
    cta1: "Get Started",
    cta2: "Learn More",
    feature1: "Premium design that feels intentional and credible.",
    feature2: "Clear structure built around conversion and trust.",
    feature3: "Flexible enough for lead gen, offers, and launches.",
    testimonial1: "This actually feels like a usable landing page.",
    testimonial2: "Way stronger than a random template."
  };
}

function buildTheme(template) {
  const themes = {
    premium: {
      bg1: "#081120",
      bg2: "#0f172a",
      panel: "rgba(15, 23, 42, 0.85)",
      card: "#111c34",
      text: "#f8fafc",
      muted: "#cbd5e1",
      line: "rgba(255,255,255,0.08)",
      primary: "#22c55e",
      primary2: "#16a34a",
      accent: "#60a5fa",
      accent2: "#8b5cf6"
    },
    bold: {
      bg1: "#0f0f10",
      bg2: "#18181b",
      panel: "rgba(24,24,27,0.88)",
      card: "#18181b",
      text: "#fafafa",
      muted: "#d4d4d8",
      line: "rgba(255,255,255,0.08)",
      primary: "#f43f5e",
      primary2: "#e11d48",
      accent: "#fb7185",
      accent2: "#f97316"
    },
    minimal: {
      bg1: "#111827",
      bg2: "#1f2937",
      panel: "rgba(17,24,39,0.9)",
      card: "#1f2937",
      text: "#f9fafb",
      muted: "#d1d5db",
      line: "rgba(255,255,255,0.08)",
      primary: "#10b981",
      primary2: "#059669",
      accent: "#34d399",
      accent2: "#6ee7b7"
    }
  };

  return themes[template] || themes.premium;
}

function generateProject(prompt, template = "premium", affiliateLink = "") {
  const rawPrompt = String(prompt || "AI Website").trim();
  const safePrompt = escapeHtml(rawPrompt);
  const info = detectNiche(rawPrompt);
  const theme = buildTheme(template);
  const projectName = slugify(rawPrompt);
  const brandName = titleCase(rawPrompt.split(" ").slice(0, 4).join(" "));

  const finalAffiliateLink = affiliateLink && affiliateLink.trim() ? affiliateLink.trim() : "#";
  const affiliateButton = info.niche === "affiliate"
    ? `<a class="btn btn-secondary" href="${finalAffiliateLink}" target="_blank" rel="noopener">Visit Recommended Offer</a>`
    : "";

  const disclosure = info.niche === "affiliate"
    ? `<p class="small">Disclosure: this page may contain promotional links.</p>`
    : "";

  const styleCss = `
:root {
  --bg1: ${theme.bg1};
  --bg2: ${theme.bg2};
  --panel: ${theme.panel};
  --card: ${theme.card};
  --text: ${theme.text};
  --muted: ${theme.muted};
  --line: ${theme.line};
  --primary: ${theme.primary};
  --primary2: ${theme.primary2};
  --accent: ${theme.accent};
  --accent2: ${theme.accent2};
  --shadow: 0 20px 60px rgba(0,0,0,0.35);
  --radius: 22px;
  --max: 1140px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(96,165,250,0.16), transparent 28%),
    radial-gradient(circle at top right, rgba(139,92,246,0.14), transparent 28%),
    linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%);
}

a { color: inherit; text-decoration: none; }

.wrap {
  width: min(var(--max), calc(100% - 32px));
  margin: 0 auto;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(8,17,32,0.72);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}

.nav-inner {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.brand {
  font-size: 22px;
  font-weight: 800;
}

.nav-links {
  display: flex;
  gap: 16px;
  color: var(--muted);
  font-size: 14px;
}

.hero {
  padding: 84px 0 56px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  align-items: center;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  background: rgba(96,165,250,0.12);
  color: #bfdbfe;
  border: 1px solid rgba(96,165,250,0.24);
}

.hero h1 {
  margin: 0 0 14px;
  font-size: clamp(42px, 7vw, 76px);
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.hero p {
  margin: 0 0 24px;
  max-width: 720px;
  font-size: 18px;
  line-height: 1.7;
  color: var(--muted);
}

.btn-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 12px 22px;
  border-radius: 14px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
  opacity: 0.97;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary2));
  color: white;
  box-shadow: var(--shadow);
}

.btn-secondary {
  background: rgba(255,255,255,0.04);
  border-color: var(--line);
  color: white;
}

.panel, .card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.hero-card {
  padding: 24px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 18px;
}

.metric {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
}

.metric strong {
  display: block;
  font-size: 28px;
  margin-bottom: 6px;
}

.section {
  padding: 28px 0 68px;
}

.section-title {
  margin: 0 0 12px;
  text-align: center;
  font-size: clamp(30px, 5vw, 48px);
  letter-spacing: -0.02em;
}

.section-copy {
  max-width: 760px;
  margin: 0 auto 28px;
  text-align: center;
  color: var(--muted);
  line-height: 1.7;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.card {
  padding: 24px;
}

.card h3 {
  margin: 0 0 12px;
  font-size: 22px;
}

.card p {
  margin: 0;
  line-height: 1.7;
  color: var(--muted);
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.quote {
  font-size: 22px;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0 0 16px;
}

.quote-by {
  color: var(--muted);
  font-size: 14px;
}

.form-box {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

input, textarea, select {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.04);
  color: white;
  font-size: 16px;
}

textarea {
  min-height: 140px;
  resize: vertical;
}

.small {
  color: var(--muted);
  font-size: 13px;
  margin-top: 14px;
}

.footer {
  padding: 24px 0 50px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 920px) {
  .hero-grid, .grid-3, .split {
    grid-template-columns: 1fr;
  }
  .metric-grid {
    grid-template-columns: 1fr;
  }
  .nav-links {
    display: none;
  }
}
`;

  const scriptJs = `
function fakeLeadCapture(event) {
  event.preventDefault();
  alert("Lead form submitted. Connect this to email, Sheets, or CRM next.");
}
`;

  const indexHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${brandName}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
</head>
<body>

<header class="nav">
  <div class="wrap nav-inner">
    <div class="brand">${brandName}</div>
    <nav class="nav-links">
      <a href="#features">Features</a>
      <a href="pricing.html">Pricing</a>
      <a href="contact.html">Contact</a>
      <a href="about.html">About</a>
    </nav>
    <a class="btn btn-primary" href="#lead">${info.cta1}</a>
  </div>
</header>

<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">${titleCase(info.niche)} · ${titleCase(template)}</span>
      <h1>${info.headline}</h1>
      <p>${info.subheadline}</p>

      <div class="btn-row">
        <a class="btn btn-primary" href="#lead">${info.cta1}</a>
        <a class="btn btn-secondary" href="#features">${info.cta2}</a>
        ${affiliateButton}
      </div>

      ${disclosure}
    </div>

    <div class="panel hero-card">
      <h3 style="margin-top:0;font-size:28px;">Premium structure built for action.</h3>
      <p style="color:var(--muted);line-height:1.7;">
        This build includes strong hierarchy, trust sections, pricing, lead form structure,
        and monetization-ready placement.
      </p>

      <div class="metric-grid">
        <div class="metric"><strong>01</strong><span>Better trust</span></div>
        <div class="metric"><strong>02</strong><span>Cleaner CTA flow</span></div>
        <div class="metric"><strong>03</strong><span>Faster monetization</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="wrap">
    <h2 class="section-title">Built like a real offer, not a throwaway mockup.</h2>
    <p class="section-copy">
      Every generated page is structured to look stronger, convert faster, and feel more premium.
    </p>

    <div class="grid-3">
      <div class="card">
        <h3>Premium Layout</h3>
        <p>${info.feature1}</p>
      </div>
      <div class="card">
        <h3>Conversion Flow</h3>
        <p>${info.feature2}</p>
      </div>
      <div class="card">
        <h3>Launch Ready</h3>
        <p>${info.feature3}</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="card">
      <p class="quote">"${info.testimonial1}"</p>
      <div class="quote-by">— Example social proof</div>
    </div>
    <div class="card">
      <p class="quote">"${info.testimonial2}"</p>
      <div class="quote-by">— Conversion-minded structure</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="section-title">Simple pricing section included.</h2>
    <p class="section-copy">Swap these placeholders with your real offer, plan, or affiliate comparison.</p>

    <div class="grid-3">
      <div class="card">
        <h3>Starter</h3>
        <p>$0</p>
      </div>
      <div class="card">
        <h3>Pro</h3>
        <p>$49</p>
      </div>
      <div class="card">
        <h3>Elite</h3>
        <p>$149</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="lead">
  <div class="wrap">
    <h2 class="section-title">Capture the lead now.</h2>
    <p class="section-copy">This form is ready to connect to email, Sheets, or CRM later.</p>

    <form class="panel form-box" onsubmit="fakeLeadCapture(event)">
      <div class="form-grid">
        <input type="text" placeholder="Your name" required />
        <input type="email" placeholder="Your email" required />
        <input type="text" placeholder="Phone number" />
        <textarea placeholder="How can we help?"></textarea>
        <button class="btn btn-primary" type="submit">${info.cta1}</button>
      </div>
      <p class="small">Connect this form to your follow-up system next.</p>
    </form>
  </div>
</section>

<footer class="footer">
  Generated by Dakota AI Builder · ${brandName}
</footer>

<script src="script.js"></script>
</body>
</html>`;

  const aboutHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>About ${brandName}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="nav">
  <div class="wrap nav-inner">
    <div class="brand">${brandName}</div>
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="pricing.html">Pricing</a>
      <a href="contact.html">Contact</a>
    </nav>
    <a class="btn btn-primary" href="contact.html">Contact</a>
  </div>
</header>

<section class="section">
  <div class="wrap">
    <h1 class="section-title">About ${brandName}</h1>
    <p class="section-copy">
      ${brandName} is positioned to help users take action faster with a stronger, cleaner offer.
    </p>

    <div class="grid-3">
      <div class="card"><h3>Clarity</h3><p>Clear message. Clear next step. Less friction.</p></div>
      <div class="card"><h3>Trust</h3><p>Premium structure makes the offer feel more credible.</p></div>
      <div class="card"><h3>Action</h3><p>Built to move people toward clicks, leads, and conversions.</p></div>
    </div>
  </div>
</section>

<footer class="footer">About ${brandName}</footer>
</body>
</html>`;

  const pricingHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pricing ${brandName}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="nav">
  <div class="wrap nav-inner">
    <div class="brand">${brandName}</div>
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </nav>
    <a class="btn btn-primary" href="contact.html">Start</a>
  </div>
</header>

<section class="section">
  <div class="wrap">
    <h1 class="section-title">Pricing</h1>
    <p class="section-copy">Use this section for plans, packages, or affiliate comparison framing.</p>

    <div class="grid-3">
      <div class="card"><h3>Starter</h3><p>$0</p></div>
      <div class="card"><h3>Pro</h3><p>$49</p></div>
      <div class="card"><h3>Elite</h3><p>$149</p></div>
    </div>
  </div>
</section>

<footer class="footer">Pricing ${brandName}</footer>
</body>
</html>`;

  const contactHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Contact ${brandName}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="nav">
  <div class="wrap nav-inner">
    <div class="brand">${brandName}</div>
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="pricing.html">Pricing</a>
    </nav>
    <a class="btn btn-primary" href="#form">Send Message</a>
  </div>
</header>

<section class="section">
  <div class="wrap">
    <h1 class="section-title">Contact</h1>
    <p class="section-copy">Use this for quote requests, demos, partnerships, or support.</p>

    <form class="panel form-box" id="form" onsubmit="fakeLeadCapture(event)">
      <div class="form-grid">
        <input type="text" placeholder="Your name" required />
        <input type="email" placeholder="Your email" required />
        <textarea placeholder="How can we help?"></textarea>
        <button class="btn btn-primary" type="submit">Send Message</button>
      </div>
    </form>
  </div>
</section>

<footer class="footer">Contact ${brandName}</footer>
<script src="script.js"></script>
</body>
</html>`;

  const readme = `# ${brandName}

Generated by Dakota AI Builder.

Includes:
- index.html
- about.html
- pricing.html
- contact.html
- style.css
- script.js

Next upgrades:
- plug real affiliate links
- connect real lead forms
- connect Stripe
- connect analytics
`;

  const previewHtml = indexHtml
    .replace(`<link rel="stylesheet" href="style.css">`, `<style>${styleCss}</style>`)
    .replace(`<script src="script.js"></script>`, `<script>${scriptJs}</script>`);

  return {
    success: true,
    prompt: rawPrompt,
    projectName,
    template,
    niche: info.niche,
    previewHtml,
    files: {
      "index.html": indexHtml,
      "about.html": aboutHtml,
      "pricing.html": pricingHtml,
      "contact.html": contactHtml,
      "style.css": styleCss,
      "script.js": scriptJs,
      "README.md": readme
    }
  };
}

function createZipBuffer(files) {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip");
    const chunks = [];

    archive.on("data", chunk => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", err => reject(err));

    Object.keys(files).forEach(name => {
      archive.append(files[name], { name });
    });

    archive.finalize();
  });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ status: "online", app: "Dakota AI Builder" });
});

app.get("/check-env", (req, res) => {
  res.json({
    hasNetlifyToken: !!process.env.NETLIFY_TOKEN
  });
});

app.get("/analytics", (req, res) => {
  res.json({
    analytics,
    savedProjects: savedProjects.length
  });
});

app.get("/projects", (req, res) => {
  res.json({
    items: savedProjects.slice(-10).reverse()
  });
});

app.post("/build", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  usage[ip] = usage[ip] || 0;

  if (usage[ip] >= 3) {
    return res.json({
      success: false,
      error: "Free limit reached. Upgrade required.",
      upgrade: "/upgrade"
    });
  }

  usage[ip]++;
  analytics.builds++;

  const prompt = req.body.prompt || "AI Website";
  const template = req.body.template || "premium";
  const affiliateLink = req.body.affiliateLink || "";

  const project = generateProject(prompt, template, affiliateLink);
  res.json(project);
});

app.post("/save-project", (req, res) => {
  const project = req.body || {};

  if (!project.projectName) {
    return res.json({ success: false, error: "Missing projectName" });
  }

  savedProjects.push({
    id: Date.now(),
    projectName: project.projectName,
    template: project.template || "premium",
    niche: project.niche || "general",
    createdAt: new Date().toISOString()
  });

  analytics.saves++;

  res.json({ success: true, saved: true });
});

app.post("/download", (req, res) => {
  try {
    const project = req.body || {};

    if (!project.files) {
      return res.json({ success: false, error: "Missing files" });
    }

    analytics.downloads++;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=${project.projectName || "site"}.zip`);

    const archive = archiver("zip");
    archive.pipe(res);

    Object.keys(project.files).forEach(name => {
      archive.append(project.files[name], { name });
    });

    archive.finalize();
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post("/deploy", async (req, res) => {
  try {
    const token = process.env.NETLIFY_TOKEN;
    const project = req.body || {};

    if (!token) {
      return res.json({ success: false, error: "Missing NETLIFY_TOKEN" });
    }

    if (!project.files) {
      return res.json({ success: false, error: "Missing files" });
    }

    const zipBuffer = await createZipBuffer(project.files);

    const netlifyRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/zip"
      },
      body: zipBuffer
    });

    const netlifyData = await netlifyRes.json();

    if (!netlifyRes.ok) {
      return res.json({
        success: false,
        error: "Netlify deploy failed",
        details: netlifyData
      });
    }

    analytics.deploys++;

    res.json({
      success: true,
      url: netlifyData.ssl_url || netlifyData.url || netlifyData.deploy_ssl_url || null
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post("/upgrade", (req, res) => {
  analytics.upgradeClicks++;
  res.json({
    success: true,
    message: "Upgrade to unlimited builds",
    link: "https://buy.stripe.com/test_yourlink"
  });
});

app.listen(PORT, () => {
  console.log("Master system running on port " + PORT);
});
