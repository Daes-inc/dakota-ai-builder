import express from "express";
import cors from "cors";
import archiver from "archiver";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function slugify(text) {
  return (text || "app")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "app";
}

function generateProject(prompt) {
  const name = prompt || "My App";
  const projectName = slugify(name);

  const html = `<!DOCTYPE html>
<html>
<head>
<title>${name}</title>
<style>
body {
  background:#111;
  color:white;
  text-align:center;
  font-family:Arial;
  margin:0;
  padding:40px;
}
button {
  padding:10px 20px;
  background:#22c55e;
  border:none;
  color:white;
  font-size:18px;
  cursor:pointer;
  border-radius:8px;
}
</style>
</head>
<body>
<h1>${name}</h1>
<button onclick="alert('App working')">Click Me</button>
<script>
console.log("App loaded");
</script>
</body>
</html>`;

  return {
    projectName,
    files: {
      "index.html": html,
      "style.css": "/* moved inline */",
      "script.js": "// moved inline"
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

app.get("/", (req, res) => {
  res.send(`
  <h1>Dakota AI Builder</h1>
  <input id="prompt" value="test app"/>
  <br/><br/>
  <button onclick="build()">Build</button>
  <button onclick="download()">Download</button>
  <button onclick="deployLive()">Deploy Live</button>

  <pre id="out"></pre>
  <iframe id="preview" style="width:100%;height:400px;border:1px solid #ccc;"></iframe>

<script>
async function build(){
  const prompt = document.getElementById("prompt").value;

  const res = await fetch("/create-app", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({prompt})
  });

  const data = await res.json();

  document.getElementById("out").textContent =
    JSON.stringify(data,null,2);

  document.getElementById("preview").srcdoc =
    data.files["index.html"];
}

async function download(){
  const prompt = document.getElementById("prompt").value;

  const res = await fetch("/download-app", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({prompt})
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "app.zip";
  a.click();

  URL.revokeObjectURL(url);
}

async function deployLive(){
  const prompt = document.getElementById("prompt").value;

  const res = await fetch("/deploy-live", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({prompt})
  });

  const data = await res.json();

  document.getElementById("out").textContent =
    JSON.stringify(data,null,2);

  if (data.previewHtml) {
    document.getElementById("preview").srcdoc = data.previewHtml;
  }

  if (data.liveUrl) {
    alert("Live site: " + data.liveUrl);
  }
}
</script>
  `);
});

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

    const liveUrl =
      createData.ssl_url ||
      createData.url ||
      createData.deploy_ssl_url ||
      null;

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
