// utility.js
// Handles page switching and loading HTML content into #app
async function loadPage(page) {
  const res = await fetch(`pages/${page}.html`);
  const html = await res.text();
  document.getElementById("app").innerHTML = html;

  if (typeof onPageLoad === "function") onPageLoad(page);

  // Reapply theme after page is injected
  applySavedTheme();
}

// Close when clicking outside (overlay)
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  overlay.addEventListener("click", () => toggleSidebar(false));

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleSidebar(false);
  });
});


// Handle sidebar toggle
function toggleSidebar(force = null) {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  const isOpen = !sidebar.classList.contains("hidden");

  const shouldOpen = force !== null ? force : !isOpen;

  if (shouldOpen) {
    sidebar.classList.remove("hidden");
    overlay.classList.add("show");
    overlay.classList.remove("hidden");
  } else {
    sidebar.classList.add("hidden");
    overlay.classList.remove("show");
    overlay.classList.add("hidden");
  }
}

function changeTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);

   // Sync dropdown so it matches
  const selector = document.querySelector('.theme-picker');
  if (selector) selector.value = theme;

  // Sync toggle checkbox if it's dark mode
  const isDark = theme === "dark";
  document.querySelectorAll('#darkToggle').forEach(toggle => {
    toggle.checked = isDark;
  });
}

// Call this once on load
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme;

  console.log("🎨 Applying saved theme:", savedTheme);

  const selector = document.querySelector(".theme-picker");
  if (selector) {
    selector.value = savedTheme;
    console.log("✅ Dropdown synced to:", savedTheme);
  } else {
    console.warn("❌ Dropdown .theme-picker not found!");
  }
}

function applySavedTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.body.className = saved;
  console.log("🎨 Applying saved theme:", saved);

  requestAnimationFrame(() => {
    const themeDropdown = document.querySelector(".theme-picker");
    if (themeDropdown) {
      themeDropdown.value = saved;
      console.log("✅ Dropdown found and set to:", saved);
    } else {
      console.warn("⚠️ No dropdown in this page — skipping sync");
    }
  });
}