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

  return {
    projectName,
    files: {
      "index.html": `<!DOCTYPE html>
<html>
<head>
<title>${name}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<h1>${name}</h1>
<button onclick="alert('App working')">Click Me</button>
<script src="script.js"></script>
</body>
</html>`,

      "style.css": `body {
  background: #111;
  color: white;
  text-align: center;
  font-family: Arial;
}`,

      "script.js": `console.log("App loaded");`
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

  const html = data.files["index.html"];
  document.getElementById("preview").srcdoc = html;
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
