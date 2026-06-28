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

/* =========================================================
   Project case-study modal
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const PROJECTS = {
    beansocial: {
      kicker: "Mobile App · Graduation Project",
      title: "BeanSocial",
      overview:
        "A social platform for coffee lovers to share recipes, save their favorite brews, and discover new types of coffee. Built end to end as my graduation project.",
      role: "Solo project — UI design, full Flutter build, and Firebase backend.",
      highlights: [
        "User accounts and profiles with Firebase Authentication",
        "Create, share and browse coffee recipes",
        "Save favorites and build a personal collection",
        "Real-time data sync with Cloud Firestore",
        "App-wide state handled with GetX",
      ],
      tags: ["Flutter", "Dart", "GetX", "Firebase"],
      github: "https://github.com/KaanCan1/beansocial_son",
      demo: null,
    },
    spendly: {
      kicker: "Mobile App + Backend",
      title: "Spendly",
      overview:
        "A clean, minimal expense tracker that helps you stay on top of your spending — a Flutter client backed by a custom Node.js API and containerized with Docker.",
      role: "Full-stack — Flutter front end, Node.js REST API, and Docker setup.",
      highlights: [
        "Guided onboarding flow",
        "Add and categorize expenses quickly",
        "Weekly summary with a spending chart",
        "Full transaction history and settings",
        "Node.js REST backend, reproducible via Docker Compose",
      ],
      tags: ["Flutter", "Dart", "Node.js", "Docker"],
      github: "https://github.com/KaanCan1/Spendly",
      demo: null,
    },
    sentiment: {
      kicker: "Machine Learning",
      title: "Film Review Sentiment Analysis",
      overview:
        "An NLP project that classifies movie reviews as positive or negative, comparing several classic machine-learning models on a labeled review dataset.",
      role: "Group project for an Introduction to Information Engineering course.",
      highlights: [
        "Text cleaning, stop-word removal and tokenization",
        "Trained Naive Bayes, Logistic Regression, SVM and Random Forest",
        "Compared models on accuracy, F1 score and confusion matrix",
        "End-to-end pipeline from raw reviews to evaluation",
      ],
      tags: ["Python", "scikit-learn", "NLP", "pandas"],
      github: "https://github.com/KaanCan1/Film-Yorumlari-Duygu-Analizi",
      demo: null,
    },
    moodaktif: {
      kicker: "Native Android",
      title: "MoodAktif",
      overview:
        "A mood-focused Android application built natively with Java and Android Studio.",
      role: "Solo project exploring native Android development.",
      highlights: [
        "Native Android UI built in Java",
        "Activity-based navigation",
        "On-device local state",
      ],
      tags: ["Java", "Android Studio"],
      github: "https://github.com/KaanCan1/MoodAktif",
      demo: null,
    },
    chartplotter: {
      kicker: "Data Visualization",
      title: "Simple Chart Plotter",
      overview:
        "A lightweight Python tool for reading data and plotting it into clean charts, made to take the friction out of quick dataset exploration.",
      role: "Solo project.",
      highlights: [
        "Reads input data and renders charts",
        "Fast visual exploration of datasets",
        "Small, focused and easy to run",
      ],
      tags: ["Python", "Matplotlib"],
      github: "https://github.com/KaanCan1/Simple-Chart-Plotter",
      demo: null,
    },
  };

  const modal = document.getElementById("project-modal");
  if (!modal) return;

  const elKicker = document.getElementById("pm-kicker");
  const elTitle = document.getElementById("pm-title");
  const elOverview = document.getElementById("pm-overview");
  const elHighlights = document.getElementById("pm-highlights");
  const elRole = document.getElementById("pm-role");
  const elTags = document.getElementById("pm-tags");
  const elActions = document.getElementById("pm-actions");
  let lastFocused = null;

  function makeLink(href, className, iconClass, label) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = className;
    a.innerHTML = '<i class="' + iconClass + '"></i> ' + label;
    return a;
  }

  function openModal(key) {
    const p = PROJECTS[key];
    if (!p) return;

    elKicker.textContent = p.kicker;
    elTitle.textContent = p.title;
    elOverview.textContent = p.overview;

    elHighlights.innerHTML = "";
    p.highlights.forEach(function (h) {
      const li = document.createElement("li");
      li.textContent = h;
      elHighlights.appendChild(li);
    });

    elRole.textContent = p.role;

    elTags.innerHTML = "";
    p.tags.forEach(function (t) {
      const span = document.createElement("span");
      span.textContent = t;
      elTags.appendChild(span);
    });

    elActions.innerHTML = "";
    if (p.demo) {
      elActions.appendChild(
        makeLink(p.demo, "github-btn", "fas fa-arrow-up-right-from-square", "Live Demo")
      );
      elActions.appendChild(
        makeLink(p.github, "btn btn-color-2", "fab fa-github", "View on GitHub")
      );
    } else {
      elActions.appendChild(
        makeLink(p.github, "github-btn", "fab fa-github", "View on GitHub")
      );
    }

    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = modal.querySelector(".project-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll("[data-project]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-project"));
    });
  });

  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
});
