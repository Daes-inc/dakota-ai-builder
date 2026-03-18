import express from "express";
import cors from "cors";
import archiver from "archiver";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function slugify(text) {
  return (text || "app")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "app";
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(text) {
  return String(text || "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function generateProject(prompt) {
  const rawPrompt = String(prompt || "premium landing page").trim();
  const safePrompt = escapeHtml(rawPrompt);
  const projectName = slugify(rawPrompt);
  const brandName = titleCase(rawPrompt.split(" ").slice(0, 3).join(" "));
  const pageTitle = `${brandName} — Premium Landing Page`;

  const feature1 = `Built for ${safePrompt.toLowerCase()} growth`;
  const feature2 = `High-converting sections and premium visuals`;
  const feature3 = `Fast, clean, mobile-first experience`;

  const testimonial1 = `"This feels like a premium product, not a template."`;
  const testimonial2 = `"Clear, polished, and built to convert visitors fast."`;

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <style>
    :root {
      --bg: #081120;
      --bg-2: #0f172a;
      --panel: rgba(15, 23, 42, 0.72);
      --panel-solid: #111c34;
      --text: #f8fafc;
      --muted: #cbd5e1;
      --line: rgba(255,255,255,0.08);
      --primary: #22c55e;
      --primary-2: #16a34a;
      --accent: #60a5fa;
      --accent-2: #8b5cf6;
      --shadow: 0 18px 60px rgba(0,0,0,0.32);
      --radius: 22px;
      --max: 1140px;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background:
        radial-gradient(circle at top left, rgba(96,165,250,0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(139,92,246,0.18), transparent 28%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
      color: var(--text);
      font-family: Arial, sans-serif;
      scroll-behavior: smooth;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .wrap {
      width: min(var(--max), calc(100% - 32px));
      margin: 0 auto;
    }

    .nav {
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(14px);
      background: rgba(8,17,32,0.72);
      border-bottom: 1px solid var(--line);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 72px;
    }

    .brand {
      font-weight: 800;
      font-size: 22px;
      letter-spacing: 0.02em;
    }

    .nav-links {
      display: flex;
      gap: 18px;
      color: var(--muted);
      font-size: 14px;
    }

    .nav-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      border: none;
      border-radius: 999px;
      padding: 12px 18px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--shadow);
    }

    .hero {
      padding: 88px 0 56px;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 28px;
      align-items: center;
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 14px;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(96,165,250,0.12);
      border: 1px solid rgba(96,165,250,0.24);
      color: #bfdbfe;
    }

    .hero h1 {
      margin: 0 0 14px;
      font-size: clamp(42px, 7vw, 74px);
      line-height: 0.96;
      letter-spacing: -0.03em;
    }

    .hero p {
      margin: 0 0 24px;
      max-width: 700px;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.65;
    }

    .cta-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 22px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 12px 20px;
      border-radius: 14px;
      border: 1px solid transparent;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
      opacity: 0.96;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-2));
      color: white;
      box-shadow: var(--shadow);
    }

    .btn-secondary {
      background: rgba(255,255,255,0.04);
      color: white;
      border-color: var(--line);
    }

    .trust-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      color: var(--muted);
      font-size: 14px;
    }

    .trust-pill {
      padding: 10px 12px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.03);
    }

    .hero-card {
      background: linear-gradient(180deg, rgba(17,28,52,0.95), rgba(10,18,34,0.98));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 24px;
      overflow: hidden;
      position: relative;
    }

    .hero-card::before {
      content: "";
      position: absolute;
      inset: -1px;
      background: linear-gradient(135deg, rgba(96,165,250,0.18), rgba(139,92,246,0.14), transparent 50%);
      z-index: 0;
    }

    .hero-card > * {
      position: relative;
      z-index: 1;
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
      text-align: left;
    }

    .metric strong {
      display: block;
      font-size: 28px;
      margin-bottom: 6px;
    }

    .section {
      padding: 28px 0 64px;
    }

    .section-title {
      text-align: center;
      margin: 0 0 12px;
      font-size: clamp(30px, 5vw, 46px);
      letter-spacing: -0.02em;
    }

    .section-copy {
      text-align: center;
      color: var(--muted);
      max-width: 760px;
      margin: 0 auto 28px;
      line-height: 1.7;
      font-size: 17px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .card {
      background: var(--panel);
      backdrop-filter: blur(12px);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
    }

    .card h3 {
      margin: 0 0 12px;
      font-size: 22px;
    }

    .card p {
      margin: 0;
      color: var(--muted);
      line-height: 1.7;
    }

    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      align-items: stretch;
    }

    .quote {
      font-size: 22px;
      line-height: 1.6;
      color: #e2e8f0;
      margin: 0 0 18px;
    }

    .quote-by {
      color: var(--muted);
      font-size: 14px;
    }

    .cta-panel {
      text-align: center;
      background: linear-gradient(135deg, rgba(96,165,250,0.13), rgba(139,92,246,0.13));
    }

    .footer {
      padding: 24px 0 48px;
      color: var(--muted);
      text-align: center;
      font-size: 14px;
    }

    @media (max-width: 920px) {
      .hero-grid,
      .split,
      .grid-3 {
        grid-template-columns: 1fr;
      }

      .nav-links {
        display: none;
      }

      .metric-grid {
        grid-template-columns: 1fr;
      }

      .hero {
        padding-top: 52px;
      }
    }
  </style>
</head>
<body>
  <header class="nav">
    <div class="wrap nav-inner">
      <div class="brand">${brandName}</div>
      <nav class="nav-links">
        <a href="#features">Features</a>
        <a href="#proof">Proof</a>
        <a href="#cta">Get Started</a>
      </nav>
      <a class="nav-cta" href="#cta">Launch Now</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <span class="eyebrow">Premium ${safePrompt}</span>
          <h1>${brandName} helps you launch faster and look elite.</h1>
          <p>
            A polished, premium-grade landing experience for <strong>${safePrompt}</strong>,
            built to feel high-end, modern, and conversion-focused from the first glance.
          </p>

          <div class="cta-row">
            <a class="btn btn-primary" href="#cta">Start Now</a>
            <a class="btn btn-secondary" href="#features">See Features</a>
          </div>

          <div class="trust-row">
            <span class="trust-pill">Premium layout</span>
            <span class="trust-pill">Mobile first</span>
            <span class="trust-pill">High-converting structure</span>
          </div>
        </div>

        <div class="hero-card">
          <h3 style="margin-top:0;font-size:28px;">Top-tier presentation, built for action.</h3>
          <p style="color:var(--muted);line-height:1.7;">
            This starter product is designed to feel premium, trustworthy, and strategically structured.
          </p>

          <div class="metric-grid">
            <div class="metric">
              <strong>01</strong>
              <span>Fast setup</span>
            </div>
            <div class="metric">
              <strong>02</strong>
              <span>Premium look</span>
            </div>
            <div class="metric">
              <strong>03</strong>
              <span>Built to convert</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="features">
      <div class="wrap">
        <h2 class="section-title">Designed like a real product, not a throwaway mockup.</h2>
        <p class="section-copy">
          Every part of this page is structured to feel intentional, elevated, and commercially useful.
        </p>

        <div class="grid-3">
          <div class="card">
            <h3>${feature1}</h3>
            <p>Strategic messaging, premium layout spacing, and a clear value-focused hierarchy.</p>
          </div>
          <div class="card">
            <h3>${feature2}</h3>
            <p>Strong headline, polished design language, and sections that feel credible and high-end.</p>
          </div>
          <div class="card">
            <h3>${feature3}</h3>
            <p>Responsive by default and built to look clean on phones, tablets, and desktop screens.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="proof">
      <div class="wrap split">
        <div class="card">
          <p class="quote">${testimonial1}</p>
          <div class="quote-by">— Early user feedback</div>
        </div>
        <div class="card">
          <p class="quote">${testimonial2}</p>
          <div class="quote-by">— Product-style presentation standard</div>
        </div>
      </div>
    </section>

    <section class="section" id="cta">
      <div class="wrap">
        <div class="card cta-panel">
          <h2 class="section-title" style="margin-top:0;">Ready to launch ${brandName}?</h2>
          <p class="section-copy">
            Use this premium foundation as your starting point, then customize content, links, branding, and offers.
          </p>
          <div class="cta-row" style="justify-content:center;">
            <button class="btn btn-primary" onclick="alert('Primary action clicked')">Launch Your Offer</button>
            <button class="btn btn-secondary" onclick="alert('Secondary action clicked')">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    Generated by Dakota AI Builder · Premium landing page mode
  </footer>
</body>
</html>`;

  return {
    projectName,
    files: {
      "index.html": fullHtml,
      "style.css": "/* styles moved inline for preview */",
      "script.js": "// scripts moved inline for preview"
    }
  };
}

function zipProjectToBuffer(project) {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip");
    const chunks = [];

    archive.on("data", chunk => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", err => reject(err));

    for (const file in project.files) {
      archive.append(project.files[file], { name: file });
    }

    archive.finalize();
  });
}

async function pollDeployReady(deployId, token) {
  for (let i = 0; i < 12; i++) {
    const res = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.state === "ready") {
      return data;
    }

    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  return null;
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dakota AI Builder</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0b1220;
      color: white;
      padding: 20px;
    }

    .wrap {
      max-width: 1100px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 10px;
      font-size: 44px;
      text-align: center;
    }

    p {
      text-align: center;
      color: #cbd5e1;
      margin-bottom: 20px;
    }

    .panel {
      background: #111c34;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 18px;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      font-size: 16px;
      border-radius: 12px;
      border: none;
      margin-bottom: 14px;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    button {
      background: #22c55e;
      color: white;
      border: none;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 700;
    }

    .secondary {
      background: #334155;
    }

    pre {
      background: #020617;
      color: #e2e8f0;
      padding: 14px;
      border-radius: 12px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      min-height: 180px;
    }

    iframe {
      width: 100%;
      height: 620px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      background: white;
    }

    .live-link {
      display: inline-block;
      margin-top: 10px;
      color: #86efac;
      font-weight: 700;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Dakota AI Builder</h1>
    <p>Premium website/app launcher mode</p>

    <div class="panel">
      <input id="prompt" value="fitness affiliate landing page" />

      <div class="actions">
        <button onclick="build()">Build</button>
        <button class="secondary" onclick="downloadApp()">Download</button>
        <button onclick="deployLive()">Deploy Live</button>
      </div>

      <div id="liveLinkWrap"></div>
    </div>

    <div class="panel">
      <pre id="out">Ready.</pre>
    </div>

    <div class="panel">
      <iframe id="preview"></iframe>
    </div>
  </div>

  <script>
    async function build() {
      const prompt = document.getElementById("prompt").value;

      const res = await fetch("/create-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      document.getElementById("out").textContent =
        JSON.stringify(data, null, 2);

      document.getElementById("preview").srcdoc =
        data.files["index.html"];

      document.getElementById("liveLinkWrap").innerHTML = "";
    }

    async function downloadApp() {
      const prompt = document.getElementById("prompt").value;

      const res = await fetch("/download-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "app.zip";
      a.click();

      URL.revokeObjectURL(url);
    }

    async function deployLive() {
      const prompt = document.getElementById("prompt").value;

      const res = await fetch("/deploy-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      document.getElementById("out").textContent =
        JSON.stringify(data, null, 2);

      if (data.previewHtml) {
        document.getElementById("preview").srcdoc = data.previewHtml;
      }

      if (data.liveUrl) {
        document.getElementById("liveLinkWrap").innerHTML =
          '<a class="live-link" target="_blank" href="' + data.liveUrl + '">' +
          data.liveUrl +
          "</a>";
      } else {
        document.getElementById("liveLinkWrap").innerHTML = "";
      }
    }
  </script>
</body>
</html>
`);
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    app: "Dakota AI Builder",
    mode: "premium"
  });
});

app.post("/create-app", (req, res) => {
  res.json(generateProject(req.body?.prompt));
});

app.post("/download-app", (req, res) => {
  const project = generateProject(req.body?.prompt);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=app.zip");

  const archive = archiver("zip");
  archive.pipe(res);

  for (const file in project.files) {
    archive.append(project.files[file], { name: file });
  }

  archive.finalize();
});

app.post("/deploy-live", async (req, res) => {
  try {
    const token = process.env.NETLIFY_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "Missing NETLIFY_TOKEN in Railway variables"
      });
    }

    const project = generateProject(req.body?.prompt);
    const zipBuffer = await zipProjectToBuffer(project);

    const createRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/zip"
      },
      body: zipBuffer
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return res.status(500).json({
        error: "Netlify create/deploy failed",
        details: createData
      });
    }

    let liveUrl =
      createData.ssl_url ||
      createData.url ||
      createData.deploy_ssl_url ||
      null;

    const deployId =
      createData.id ||
      createData.deploy_id ||
      createData.published_deploy?.id ||
      null;

    if (!liveUrl && deployId) {
      const readyDeploy = await pollDeployReady(deployId, token);
      if (readyDeploy) {
        liveUrl =
          readyDeploy.ssl_url ||
          readyDeploy.deploy_ssl_url ||
          readyDeploy.url ||
          null;
      }
    }

    res.json({
      status: "deployed",
      projectName: project.projectName,
      liveUrl,
      previewHtml: project.files["index.html"],
      netlify: createData
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
