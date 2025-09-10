function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Back-to-top behavior
document.addEventListener("DOMContentLoaded", function () {
  const backToTop = document.getElementById("back-to-top");
  if (!backToTop) return;

  function toggleBackToTopVisibility() {
    if (window.scrollY > 300) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  }

  window.addEventListener("scroll", toggleBackToTopVisibility, {
    passive: true,
  });
  toggleBackToTopVisibility();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Minimal Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
  const body = document.body;

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem("theme") || "light";

  // Apply the saved theme
  body.setAttribute("data-theme", currentTheme);

  // Function to update theme display
  function updateThemeDisplay(theme) {
    const toggles = [themeToggle, mobileThemeToggle].filter(Boolean);

    toggles.forEach((toggle) => {
      const lightIcon = toggle.querySelector(".light-icon");
      const moonIcon = toggle.querySelector(".moon-icon");
      const label = toggle.querySelector(".theme-label");

      if (theme === "dark") {
        // Show moon icon and DARK text
        if (lightIcon) lightIcon.style.display = "none";
        if (moonIcon) moonIcon.style.display = "block";
        if (label) label.textContent = "DARK";
      } else {
        // Show light icon and LIGHT text
        if (lightIcon) lightIcon.style.display = "block";
        if (moonIcon) moonIcon.style.display = "none";
        if (label) label.textContent = "LIGHT";
      }
    });
  }

  // Function to handle theme toggle
  function toggleTheme() {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Update theme
    body.setAttribute("data-theme", newTheme);

    // Update display
    updateThemeDisplay(newTheme);

    // Save preference
    localStorage.setItem("theme", newTheme);

    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  // Initialize theme display
  updateThemeDisplay(currentTheme);

  // Add click event listeners to both toggles
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);

    // Add keyboard support
    themeToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Make it focusable for accessibility
    themeToggle.setAttribute("tabindex", "0");
    themeToggle.setAttribute("role", "button");
    themeToggle.setAttribute("aria-label", "Toggle dark mode");
  }

  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", toggleTheme);

    // Add keyboard support
    mobileThemeToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Make it focusable for accessibility
    mobileThemeToggle.setAttribute("tabindex", "0");
    mobileThemeToggle.setAttribute("role", "button");
    mobileThemeToggle.setAttribute("aria-label", "Toggle dark mode");
  }
});

// CV Dropdown Functionality
function toggleCVDropdown() {
  const dropdown = document.querySelector(".cv-dropdown");
  const menu = document.getElementById("cv-dropdown-menu");

  if (dropdown && menu) {
    dropdown.classList.toggle("open");
  }
}

// Close CV dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".cv-dropdown");
  const dropdownBtn = document.querySelector(".cv-dropdown-btn");

  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove("open");
  }
});

// Close CV dropdown when pressing Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const dropdown = document.querySelector(".cv-dropdown");
    if (dropdown) {
      dropdown.classList.remove("open");
    }
  }
});

// Bottom Fade Effect - Static (her zaman görünür)
document.addEventListener("DOMContentLoaded", function () {
  const fadeOverlay = document.querySelector(".bottom-fade-overlay");
  if (!fadeOverlay) return;

  // Fade efekti her zaman aktif ve görünür
  fadeOverlay.style.opacity = 1;
});
