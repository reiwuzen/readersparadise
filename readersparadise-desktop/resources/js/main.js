// main.js
Neutralino.init();

Neutralino.events.on("ready", async () => {
  console.log("✅ Neutralino is ready!");

  await loadPage("welcome");
});


function onPageLoad(page) {
  if (page === 'home') {
    console.log("🏠 Home loaded!");
    // Later: maybe sync library, fetch updates, etc.
  }
}


async function downloadManga() {
  const urlInput = document.getElementById("urlInput");
  const statusBox = document.getElementById("status");
  const previewBox = document.getElementById("previewBox");

  if (!urlInput || !statusBox || !previewBox) {
    console.error("❌ Missing one or more DOM elements.");
    return;
  }

  const url = urlInput.value.trim();
  console.log("🌐 URL:", url);

  const echo = await Neutralino.os.execCommand("echo hello world");
  console.log("👋 Echo result:", echo.stdOut);

  if (!url) {
    statusBox.innerText = "❌ Please enter a URL!";
    return;
  }

  statusBox.innerText = "🐚 Starting curl download...";

  try {
    // Use user's Downloads folder
    const basePath = await Neutralino.os.getPath("downloads");
    const downloadsDir = `${basePath}/ReadersParadise`;

    try {
      await Neutralino.filesystem.createDirectory(downloadsDir);
      console.log("✔️ Created downloads dir.");
    } catch (e) {
      console.warn("⚠️ Directory may already exist:", e.message);
    }

    const ext = url.split('.').pop().split('?')[0] || 'jpg';
    const filename = `manga_${Date.now()}.${ext}`;
    const fullPath = `${downloadsDir}/${filename}`.replace(/\\/g, "/");

    const curlCommand = `curl -L "${url}" -o "${fullPath}"`;
    console.log("🧾 Running curl:", curlCommand);
    statusBox.innerText = `🐚 Running curl...`;

    const result = await Neutralino.os.execCommand(curlCommand);
    console.log("📤 stdout:", result.stdOut);
    console.error("📛 stderr:", result.stdErr);

    const fileList = await Neutralino.filesystem.readDirectory(downloadsDir);
    const found = fileList.find(f => f.entry === filename);
    console.log("🔍 File exists?", found ? "Yes" : "No");

    if (!found) {
      throw new Error("curl said it succeeded but no file found.");
    }

    statusBox.innerText = `✅ Downloaded: ${filename}`;
    previewBox.innerHTML = `<img src="file://${fullPath}" alt="Downloaded Image" style="max-width: 100%; max-height: 400px;">`;

  } catch (err) {
    statusBox.innerText = "❌ Download failed.";
    previewBox.innerHTML = `<pre>${err.message}</pre>`;
    console.error("🔥 Caught error:", err);
  }
}
