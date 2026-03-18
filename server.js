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
    .replace(/^-|-$/g, "");
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
}
button {
  padding:10px 20px;
  background:#22c55e;
  border:none;
  color:white;
  font-size:18px;
  cursor:pointer;
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

app.get("/", (req, res) => {
  res.send(`
  <h1>Dakota AI Builder</h1>
  <input id="prompt" value="test app"/>
  <br/><br/>
  <button onclick="build()">Build</button>
  <button onclick="download()">Download</button>

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
}
</script>
  `);
});

app.post("/create-app", (req, res) => {
  res.json(generateProject(req.body.prompt));
});

app.post("/download-app", (req, res) => {
  const project = generateProject(req.body.prompt);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=app.zip"
  );

  const archive = archiver("zip");
  archive.pipe(res);

  for (const file in project.files) {
    archive.append(project.files[file], { name: file });
  }

  archive.finalize();
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
