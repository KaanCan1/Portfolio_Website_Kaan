/* =========================================================
   Hamburger menu
   ========================================================= */
function setMenu(open) {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const overlay = document.querySelector(".menu-overlay");
  if (!menu || !icon) return;

  menu.classList.toggle("open", open);
  icon.classList.toggle("open", open);

  if (overlay) {
    overlay.style.display = open ? "block" : "none";
    overlay.style.pointerEvents = open ? "auto" : "none";
  }
}

function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  setMenu(menu ? !menu.classList.contains("open") : true);
}

function openMenu() {
  setMenu(true);
}

function closeMenu() {
  setMenu(false);
}

/* =========================================================
   CV dropdown
   ========================================================= */
function toggleCVDropdown() {
  const dropdown = document.querySelector(".cv-dropdown");
  if (dropdown) dropdown.classList.toggle("open");
}

document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".cv-dropdown");
  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove("open");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const dropdown = document.querySelector(".cv-dropdown");
    if (dropdown) dropdown.classList.remove("open");
  }
});

/* =========================================================
   DOM ready: scroll behaviours, reveals, slider, theme
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----- Back-to-top + nav scrolled state ----- */
  const backToTop = document.getElementById("back-to-top");
  const mainNav = document.getElementById("main-nav");

  function onScroll() {
    const y = window.scrollY;
    if (backToTop) backToTop.classList.toggle("show", y > 320);
    if (mainNav) mainNav.classList.toggle("scrolled", y > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----- Scroll reveal ----- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("revealed"));
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ----- Project sliders (supports multiple) ----- */
  const sliders = document.querySelectorAll(".project-slider");
  sliders.forEach(function (slider) {
    const slides = slider.querySelectorAll(".project-slide");
    if (!slides.length) return;
    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");
    let current = 0;

    function showSlide(idx) {
      slides.forEach((slide, i) => slide.classList.toggle("active", i === idx));
    }

    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
      });

    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        current = (current + 1) % slides.length;
        showSlide(current);
      });

    showSlide(current);
  });

  /* ----- Theme toggle ----- */
  const themeToggle = document.getElementById("theme-toggle");
  const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme") || "light";
  body.setAttribute("data-theme", savedTheme);

  function updateThemeDisplay(theme) {
    [themeToggle, mobileThemeToggle].filter(Boolean).forEach((toggle) => {
      const lightIcon = toggle.querySelector(".light-icon");
      const moonIcon = toggle.querySelector(".moon-icon");
      const label = toggle.querySelector(".theme-label");
      if (theme === "dark") {
        if (lightIcon) lightIcon.style.display = "none";
        if (moonIcon) moonIcon.style.display = "block";
        if (label) label.textContent = "DARK";
      } else {
        if (lightIcon) lightIcon.style.display = "block";
        if (moonIcon) moonIcon.style.display = "none";
        if (label) label.textContent = "LIGHT";
      }
    });
  }

  function toggleTheme() {
    const newTheme =
      body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", newTheme);
    updateThemeDisplay(newTheme);
    localStorage.setItem("theme", newTheme);
    if (navigator.vibrate) navigator.vibrate(30);
  }

  updateThemeDisplay(savedTheme);

  [themeToggle, mobileThemeToggle].filter(Boolean).forEach((toggle) => {
    toggle.addEventListener("click", toggleTheme);
    toggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTheme();
      }
    });
    toggle.setAttribute("tabindex", "0");
    toggle.setAttribute("role", "button");
    toggle.setAttribute("aria-label", "Toggle dark mode");
  });
});
