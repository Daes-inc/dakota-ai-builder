const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3000;

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
      audience: "people who want better results faster",
      benefit1: "Simple plan. Serious transformation.",
      benefit2: "High-energy messaging built to convert.",
      benefit3: "Designed for offers, coaching, and challenge funnels.",
      testimonial1: "This looks like a real premium fitness brand.",
      testimonial2: "Strong CTA flow and clean conversion structure.",
      cta1: "Start Your Plan",
      cta2: "See The Program"
    };
  }

  if (p.includes("roof") || p.includes("contractor") || p.includes("plumber") || p.includes("hvac") || p.includes("local business")) {
    return {
      niche: "local-business",
      audience: "local customers ready to buy",
      benefit1: "Trust-building local service layout.",
      benefit2: "Clear quote request and contact flow.",
      benefit3: "Built for calls, forms, and booked jobs.",
      testimonial1: "This feels legit and trustworthy immediately.",
      testimonial2: "Exactly what a local service business needs.",
      cta1: "Get A Free Quote",
      cta2: "Call Now"
    };
  }

  if (p.includes("affiliate") || p.includes("review") || p.includes("offer") || p.includes("casino") || p.includes("sportsbook")) {
    return {
      niche: "affiliate",
      audience: "visitors comparing options before clicking",
      benefit1: "CTA-first structure for clicks and conversions.",
      benefit2: "Comparison-ready blocks and offer positioning.",
      benefit3: "Built to support affiliate hooks and disclosures.",
      testimonial1: "Looks cleaner than most affiliate pages out there.",
      testimonial2: "Fast, focused, and built to drive clicks.",
      cta1: "See The Offer",
      cta2: "Compare Options"
    };
  }

  if (p.includes("ai") || p.includes("saas") || p.includes("software") || p.includes("app")) {
    return {
      niche: "saas",
      audience: "buyers looking for a faster smarter tool",
      benefit1: "Product-style layout with premium positioning.",
      benefit2: "Feature sections, proof, and high-converting CTA flow.",
      benefit3: "Great for waitlists, demos, and software offers.",
      testimonial1: "This looks like a real SaaS landing page.",
      testimonial2: "Clear positioning and premium product feel.",
      cta1: "Start Free",
      cta2: "Book A Demo"
    };
  }

  return {
    niche: "general",
    audience: "people ready to take action",
    benefit1: "Premium design that feels credible fast.",
    benefit2: "Built around attention, trust, and conversion.",
    benefit3: "Strong section flow with clear next steps.",
    testimonial1: "Way stronger than a generic starter template.",
    testimonial2: "This actually feels usable right away.",
    cta1: "Get Started",
    cta2: "Learn More"
  };
}

function buildTheme(template) {
  const themes = {
    premium: {
      bg1: "#081120",
      bg2: "#0f172a",
      panel: "rgba(15, 23, 42, 0.82)",
      card: "#111c34",
      text: "#f8fafc",
      muted: "#cbd5e1",
      line: "rgba(255,255,255,0.08)",
      primary: "#22c55e",
      primary2: "#16a34a",
      accent: "#60a5fa",
      accent2: "#8b5cf6"
    },
    minimal: {
      bg1: "#111827",
      bg2: "#1f2937",
      panel: "rgba(17, 24, 39, 0.88)",
      card: "#1f2937",
      text: "#f9fafb",
      muted: "#d1d5db",
      line: "rgba(255,255,255,0.10)",
      primary: "#10b981",
      primary2: "#059669",
      accent: "#34d399",
      accent2: "#6ee7b7"
    },
    bold: {
      bg1: "#09090b",
      bg2: "#18181b",
      panel: "rgba(24, 24, 27, 0.88)",
      card: "#18181b",
      text: "#fafafa",
      muted: "#d4d4d8",
      line: "rgba(255,255,255,0.08)",
      primary: "#f43f5e",
      primary2: "#e11d48",
      accent: "#fb7185",
      accent2: "#f97316"
    }
  };

  return themes[template] || themes.premium;
}

function generateProject(prompt, template = "premium", affiliateLink = "") {
  const rawPrompt = String(prompt || "Premium Landing Page").trim();
  const safePrompt = escapeHtml(rawPrompt);
  const projectName = slugify(rawPrompt);
  const brandName = titleCase(rawPrompt.split(" ").slice(0, 4).join(" "));
  const theme = buildTheme(template);
  const info = detectNiche(rawPrompt);

  const safeAffiliateLink = affiliateLink && affiliateLink.trim()
    ? affiliateLink.trim()
    : "#";

  const disclosure = info.niche === "affiliate"
    ? `<p class="disclosure">Disclosure: this page may contain promotional links.</p>`
    : "";

  const affiliateButton = info.niche === "affiliate"
    ? `<a class="btn btn-secondary" href="${safeAffiliateLink}" target="_blank" rel="noopener">Visit Recommended Offer</a>`
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
  --radius: 22px;
  --shadow: 0 20px 60px rgba(0,0,0,0.35);
  --max: 1140px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(96,165,250,0.16), transparent 30%),
    radial-gradient(circle at top right, rgba(139,92,246,0.14), transparent 30%),
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
  backdrop-filter: blur(14px);
  background: rgba(8,17,32,0.72);
  border-bottom: 1px solid var(--line);
}

.nav-inner {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  padding: 84px 0 54px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
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
  max-width: 700px;
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
  color: white;
  border-color: var(--line);
}

.panel, .card {
  background: var(--panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
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

.lead-form {
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

.disclosure {
  margin-top: 18px;
  color: var(--muted);
  font-size: 13px;
}

.footer {
  padding: 24px 0 50px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.notice {
  margin-top: 14px;
  color: var(--muted);
  font-size: 14px;
  text-align: center;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
}

.compare-table td, .compare-table th {
  border-bottom: 1px solid var(--line);
  padding: 12px;
  text-align: left;
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
function submitLeadForm(event) {
  event.preventDefault();
  alert("Lead captured. Connect this form to email, CRM, or Google Sheets next.");
}
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandName}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="nav">
    <div class="wrap nav-inner">
      <div class="brand">${brandName}</div>
      <nav class="nav-links">
        <a href="#features">Features</a>
        <a href="pricing.html">Pricing</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
      </nav>
      <a class="btn btn-primary" href="#lead-form">${info.cta1}</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <span class="eyebrow">${titleCase(info.niche)} · ${escapeHtml(template)} template</span>
          <h1>${brandName} helps ${info.audience}.</h1>
          <p>
            A premium, conversion-focused website for <strong>${safePrompt}</strong>,
            built to look strong fast and push visitors toward action.
          </p>
          <div class="btn-row">
            <a class="btn btn-primary" href="#lead-form">${info.cta1}</a>
            <a class="btn btn-secondary" href="#features">${info.cta2}</a>
            ${affiliateButton}
          </div>
          ${disclosure}
        </div>

        <div class="panel hero-card">
          <h3 style="margin-top:0;font-size:28px;">Built like a real product, not a throwaway demo.</h3>
          <p style="line-height:1.7;color:var(--muted);">
            This project includes multi-page structure, premium styling, lead capture,
            pricing, and deployment-ready files.
          </p>
          <div class="metric-grid">
            <div class="metric"><strong>01</strong><span>Fast build</span></div>
            <div class="metric"><strong>02</strong><span>Premium look</span></div>
            <div class="metric"><strong>03</strong><span>Ready to deploy</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="features">
      <div class="wrap">
        <h2 class="section-title">Made to convert, not just exist.</h2>
        <p class="section-copy">
          This builder generates polished pages with business structure, clear CTA flow,
          and flexible monetization hooks.
        </p>

        <div class="grid-3">
          <div class="card">
            <h3>${info.benefit1}</h3>
            <p>Sharper positioning, stronger hierarchy, and a better first impression.</p>
          </div>
          <div class="card">
            <h3>${info.benefit2}</h3>
            <p>Strategic sections that push users toward clicks, forms, and conversions.</p>
          </div>
          <div class="card">
            <h3>${info.benefit3}</h3>
            <p>Designed for landing pages, lead generation, affiliate offers, and launches.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap split">
        <div class="card">
          <p class="quote">"${info.testimonial1}"</p>
          <div class="quote-by">— Example feedback</div>
        </div>
        <div class="card">
          <p class="quote">"${info.testimonial2}"</p>
          <div class="quote-by">— Conversion-minded layout</div>
        </div>
      </div>
    </section>

    <section class="section" id="lead-form">
      <div class="wrap">
        <h2 class="section-title">Capture leads with a clean next step.</h2>
        <p class="section-copy">
          Use this form for quote requests, waitlists, demos, coaching leads, or partner inquiries.
        </p>

        <form class="panel lead-form" onsubmit="submitLeadForm(event)">
          <div class="form-grid">
            <input type="text" placeholder="Your name" required />
            <input type="email" placeholder="Email address" required />
            <input type="text" placeholder="Phone number" />
            <textarea placeholder="Tell us what you need"></textarea>
            <button class="btn btn-primary" type="submit">${info.cta1}</button>
          </div>
          <p class="notice">Connect this to your email platform, CRM, or webhook next.</p>
        </form>
      </div>
    </section>
  </main>

  <footer class="footer">
    Generated by Dakota AI Builder · ${brandName}
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>About · ${brandName}</title>
  <link rel="stylesheet" href="style.css" />
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
        ${brandName} was built to help ${info.audience}. The goal is simple:
        premium presentation, better trust, and stronger conversion flow.
      </p>

      <div class="grid-3">
        <div class="card">
          <h3>Clear positioning</h3>
          <p>Visitors should understand the offer quickly and know what to do next.</p>
        </div>
        <div class="card">
          <h3>Trust-focused</h3>
          <p>Good websites remove friction and make action feel safe and obvious.</p>
        </div>
        <div class="card">
          <h3>Built for action</h3>
          <p>Whether the goal is leads, clicks, or signups, the structure supports it.</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">About ${brandName}</footer>
</body>
</html>`;

  const pricingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pricing · ${brandName}</title>
  <link rel="stylesheet" href="style.css" />
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
      <a class="btn btn-primary" href="contact.html">Get Started</a>
    </div>
  </header>

  <section class="section">
    <div class="wrap">
      <h1 class="section-title">Pricing</h1>
      <p class="section-copy">Simple options to move people from interest to action.</p>

      <div class="grid-3">
        <div class="card">
          <h3>Starter</h3>
          <p>Use for early testing and basic lead capture.</p>
          <p style="margin-top:16px;font-size:28px;color:white;"><strong>$0</strong></p>
        </div>
        <div class="card">
          <h3>Pro</h3>
          <p>Better layout, stronger CTA flow, and premium positioning.</p>
          <p style="margin-top:16px;font-size:28px;color:white;"><strong>$49</strong></p>
        </div>
        <div class="card">
          <h3>Elite</h3>
          <p>High-converting structure, premium customization, and faster launch path.</p>
          <p style="margin-top:16px;font-size:28px;color:white;"><strong>$149</strong></p>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">Pricing for ${brandName}</footer>
</body>
</html>`;

  const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact · ${brandName}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="nav">
    <div class="wrap nav-inner">
      <div class="brand">${brandName}</div>
      <nav class="nav-links">
        <a href="index.html">Home</a>
        <a href="pricing.html">Pricing</a>
        <a href="about.html">About</a>
      </nav>
      <a class="btn btn-primary" href="#form">Send Message</a>
    </div>
  </header>

  <section class="section">
    <div class="wrap">
      <h1 class="section-title">Contact ${brandName}</h1>
      <p class="section-copy">Use this page for quotes, demos, partnerships, and support.</p>

      <form class="panel lead-form" id="form" onsubmit="submitLeadForm(event)">
        <div class="form-grid">
          <input type="text" placeholder="Your name" required />
          <input type="email" placeholder="Your email" required />
          <select>
            <option>General inquiry</option>
            <option>Quote request</option>
            <option>Demo request</option>
            <option>Partnership</option>
          </select>
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

  const thankYouHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You · ${brandName}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <section class="section">
    <div class="wrap">
      <div class="panel lead-form">
        <h1 class="section-title" style="margin-top:0;">Thank you.</h1>
        <p class="section-copy">Your next step is confirmed. Follow up with the visitor by email, text, or call.</p>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn btn-primary" href="index.html">Back Home</a>
          <a class="btn btn-secondary" href="contact.html">Contact Again</a>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;

  const readme = `# ${brandName}

Generated by Dakota AI Builder.

## Included pages
- index.html
- about.html
- pricing.html
- contact.html
- thank-you.html

## Included assets
- style.css
- script.js

## Notes
- This build includes premium styling, lead form structure, and conversion-focused sections.
- Replace placeholders with real business info.
- Connect forms to your CRM, email, or webhook.
- Replace pricing and affiliate links with real offers.
`;

  const previewHtml = indexHtml.replace(
    `<link rel="stylesheet" href="style.css" />`,
    `<style>${styleCss}</style>`
  ).replace(
    `<script src="script.js"></script>`,
    `<script>${scriptJs}</script>`
  );

  return {
    projectName,
    template,
    niche: info.niche,
    affiliateLink: safeAffiliateLink === "#" ? "" : safeAffiliateLink,
    pages: ["index.html", "about.html", "pricing.html", "contact.html", "thank-you.html"],
    previewHtml,
    files: {
      "index.html": indexHtml,
      "about.html": aboutHtml,
      "pricing.html": pricingHtml,
      "contact.html": contactHtml,
      "thank-you.html": thankYouHtml,
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

app.get("/health", (req, res) => {
  res.json({ status: "online" });
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
      error: "Free limit reached. Upgrade required.",
      upgrade: "/upgrade"
    });
  }

  usage[ip]++;
  analytics.builds++;

  const prompt = req.body && req.body.prompt ? req.body.prompt : "Premium Landing Page";
  const template = req.body && req.body.template ? req.body.template : "premium";
  const affiliateLink = req.body && req.body.affiliateLink ? req.body.affiliateLink : "";

  const project = generateProject(prompt, template, affiliateLink);
  res.json(project);
});

app.post("/save-project", (req, res) => {
  const project = req.body || {};
  if (!project.projectName) {
    return res.json({ error: "Missing projectName" });
  }

  savedProjects.push({
    id: Date.now(),
    projectName: project.projectName,
    template: project.template || "premium",
    niche: project.niche || "general",
    createdAt: new Date().toISOString()
  });

  analytics.saves++;
  res.json({ saved: true });
});

app.post("/download", async (req, res) => {
  try {
    const project = req.body || {};
    if (!project.files) {
      return res.json({ error: "Missing files" });
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
    res.json({ error: err.message });
  }
});

app.post("/deploy", async (req, res) => {
  try {
    const token = process.env.NETLIFY_TOKEN;
    const project = req.body || {};

    if (!token) {
      return res.json({ error: "Missing NETLIFY_TOKEN" });
    }

    if (!project.files) {
      return res.json({ error: "Missing files" });
    }

    const zipBuffer = await createZipBuffer(project.files);

    const siteRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/zip"
      },
      body: zipBuffer
    });

    const siteData = await siteRes.json();

    if (!siteRes.ok) {
      return res.json({
        error: "Netlify deploy failed",
        details: siteData
      });
    }

    analytics.deploys++;

    res.json({
      status: "deployed",
      url: siteData.ssl_url || siteData.url || siteData.deploy_ssl_url || null
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.post("/upgrade", (req, res) => {
  analytics.upgradeClicks++;
  res.json({
    message: "Upgrade to unlimited builds",
    link: "https://buy.stripe.com/test_yourlink"
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
