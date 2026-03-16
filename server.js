const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dakota AI Builder is running");
});

function normalizePrompt(prompt = "basic website") {
  return prompt.replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 80) || "basic website";
}

function titleCase(text) {
  return text
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildProject(prompt = "basic website") {
  const cleanPrompt = normalizePrompt(prompt);
  const title = titleCase(cleanPrompt);
  const slug = slugify(cleanPrompt);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="hero">
    <section class="card">
      <span class="badge">Dakota AI Builder</span>
      <h1>${title}</h1>
      <p>
        This project was generated from the prompt:
        <strong>"${cleanPrompt}"</strong>
      </p>
      <div class="actions">
        <button id="primaryBtn">Get Started</button>
        <button id="secondaryBtn" class="secondary">Learn More</button>
      </div>
      <p id="status" class="status">System ready.</p>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

  const styleCss = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: white;
}

.hero {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 760px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px 28px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.badge {
  display: inline-block;
  margin-bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  font-size: 14px;
}

h1 {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  margin: 0 0 20px;
  line-height: 1.05;
}

p {
  font-size: 1.15rem;
  line-height: 1.7;
  margin: 0 auto 24px;
  max-width: 640px;
}

.actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 28px;
}

button {
  border: none;
  border-radius: 12px;
  padding: 14px 22px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  background: #22c55e;
  color: #08110b;
}

button.secondary {
  background: white;
  color: #111827;
}

.status {
  margin-top: 24px;
  font-size: 0.95rem;
  opacity: 0.9;
}`;

  const scriptJs = `const primaryBtn = document.getElementById("primaryBtn");
const secondaryBtn = document.getElementById("secondaryBtn");
const status = document.getElementById("status");

primaryBtn.addEventListener("click", () => {
  status.textContent = "Primary action triggered for: ${title}";
});

secondaryBtn.addEventListener("click", () => {
  status.textContent = "More info requested for: ${title}";
});`;

  const manifestJson = JSON.stringify(
    {
      name: title,
      slug,
      prompt: cleanPrompt,
      generatedBy: "Dakota AI Builder",
      files: ["index.html", "style.css", "script.js"]
    },
    null,
    2
  );

  return {
    projectName: slug || "generated-project",
    files: {
      "index.html": indexHtml,
      "style.css": styleCss,
      "script.js": scriptJs,
      "manifest.json": manifestJson
    }
  };
}

app.get("/run", (req, res) => {
  const command = req.query.command;

  if (!command) {
    return res.json({
      status: "error",
      message: "No command provided"
    });
  }

  res.json({
    status: "success",
    command
  });
});

app.get("/generate-site", (req, res) => {
  const prompt = req.query.prompt || "basic website";
  const project = buildProject(prompt);

  res.json({
    status: "success",
    prompt,
    project
  });
});

app.get("/preview-site", (req, res) => {
  const prompt = req.query.prompt || "basic website";
  const project = buildProject(prompt);

  res.setHeader("Content-Type", "text/html");
  res.send(project.files["index.html"]
    .replace('</head>', `<style>${project.files["style.css"]}</style></head>`)
    .replace('</body>', `<script>${project.files["script.js"]}</script></body>`));
});

app.get("/files", (req, res) => {
  const prompt = req.query.prompt || "basic website";
  const project = buildProject(prompt);

  res.json({
    status: "success",
    prompt,
    projectName: project.projectName,
    files: project.files
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
}); 