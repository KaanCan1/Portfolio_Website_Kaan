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
   i18n (EN / TR) + project case-study modal
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const I18N = {
    en: {
      "nav.about": "About",
      "nav.skills": "Skills",
      "nav.projects": "Projects",
      "nav.contact": "Contact",
      "hero.status": "Available for new roles",
      "hero.hello": "Hello, I'm",
      "hero.role": "Flutter & Full Stack Developer",
      "hero.lead":
        "I build cross-platform mobile apps with Flutter and ship full-stack web products, from the interface down to the API.",
      "hero.cv": "Get My CV",
      "hero.contactBtn": "Contact",
      "cv.en": "English CV",
      "cv.tr": "Turkish CV",
      "about.title": "About Me",
      "about.bio":
        "I hold a bachelor's degree in Computer Engineering from Tokat Gaziosmanpaşa University. I work across mobile and web, building interfaces in Flutter, wiring up REST APIs and databases, and shipping the full path from design to deployment. I am curious about new technologies, comfortable owning a feature end to end, and happiest when I am solving a real problem in a team.",
      "about.experience": "Experience",
      "about.expRole": "Computer Engineering Intern",
      "about.expCompany": "EDUJI Ar-Ge Yazılım A.Ş. · Bornova, İzmir",
      "about.expDate": "July 2024 - September 2024",
      "about.education": "Education",
      "about.uni": "Tokat Gaziosmanpaşa University",
      "about.uniDeg": "BSc Computer Engineering · 2021 - 2025",
      "about.hs": "Kepirtepe Anatolian High School",
      "about.hsDate": "Graduated 2021",
      "about.languages": "Languages",
      "lang.tr.name": "Turkish",
      "lang.tr.level": "Native",
      "lang.en.name": "English",
      "lang.en.level": "B2 Upper-Intermediate",
      "lang.de.name": "German",
      "lang.de.level": "A1 Beginner",
      "skills.title": "Skills & Tools",
      "skills.langs": "Languages & Frameworks",
      "skills.tools": "Tools & Databases",
      "projects.eyebrow": "Selected Work",
      "projects.title": "Projects",
      "proj.beansocial.kicker": "Mobile App · Graduation Project",
      "proj.beansocial.desc":
        "A social platform for coffee lovers to share recipes, save their favorite brews, and discover new types of coffee. Auth, real-time data, and state management handled end to end.",
      "proj.spendly.kicker": "Mobile App + Backend",
      "proj.spendly.desc":
        "A clean, minimal expense tracker that keeps you on top of your spending. Flutter front end backed by a Node.js API, containerized with Docker for a reproducible setup.",
      "proj.sentiment.kicker": "Machine Learning",
      "proj.sentiment.desc":
        "Classifies movie reviews as positive or negative. Text cleaning and tokenization feed several models (Naive Bayes, Logistic Regression, SVM, Random Forest) compared on accuracy and F1.",
      "proj.moodaktif.kicker": "Native Android",
      "proj.moodaktif.desc":
        "A mood-focused Android application built natively with Java and Android Studio, exploring activity-based UI and local state on device.",
      "proj.chart.kicker": "Data Visualization",
      "proj.chart.desc":
        "A lightweight Python tool for reading data and plotting it into clean charts, built to make quick visual exploration of datasets painless.",
      "btn.caseStudy": "Case study",
      "btn.allRepos": "See all repositories",
      "contact.title": "Get in Touch",
      "form.name": "Your Name",
      "form.subject": "Subject",
      "form.email": "Email",
      "form.message": "Your Message",
      "form.send": "Send Message",
      "footer.copyright": "Copyright © 2025 Kaan Can Kurt. All Rights Reserved.",
      "modal.built": "What I built",
      "modal.role": "My role",
      "modal.stack": "Stack",
      "modal.viewGithub": "View on GitHub",
      "modal.liveDemo": "Live Demo",
    },
    tr: {
      "nav.about": "Hakkımda",
      "nav.skills": "Yetenekler",
      "nav.projects": "Projeler",
      "nav.contact": "İletişim",
      "hero.status": "Yeni rollere açığım",
      "hero.hello": "Merhaba, ben",
      "hero.role": "Flutter & Full Stack Geliştirici",
      "hero.lead":
        "Flutter ile çoklu platform mobil uygulamalar geliştiriyor, arayüzden API'ye kadar full-stack web ürünleri yayınlıyorum.",
      "hero.cv": "CV'mi Al",
      "hero.contactBtn": "İletişim",
      "cv.en": "İngilizce CV",
      "cv.tr": "Türkçe CV",
      "about.title": "Hakkımda",
      "about.bio":
        "Tokat Gaziosmanpaşa Üniversitesi Bilgisayar Mühendisliği lisans mezunuyum. Mobil ve web tarafında çalışıyorum: Flutter ile arayüzler kuruyor, REST API'leri ve veritabanlarını bağlıyor, tasarımdan dağıtıma kadar tüm süreci yürütüyorum. Yeni teknolojilere meraklıyım, bir özelliği baştan sona sahiplenmekten ve bir ekip içinde gerçek bir problemi çözmekten keyif alırım.",
      "about.experience": "Deneyim",
      "about.expRole": "Bilgisayar Mühendisliği Stajyeri",
      "about.expCompany": "EDUJI Ar-Ge Yazılım A.Ş. · Bornova, İzmir",
      "about.expDate": "Temmuz 2024 - Eylül 2024",
      "about.education": "Eğitim",
      "about.uni": "Tokat Gaziosmanpaşa Üniversitesi",
      "about.uniDeg": "Bilgisayar Mühendisliği Lisans · 2021 - 2025",
      "about.hs": "Kepirtepe Anadolu Lisesi",
      "about.hsDate": "2021 mezunu",
      "about.languages": "Diller",
      "lang.tr.name": "Türkçe",
      "lang.tr.level": "Anadil",
      "lang.en.name": "İngilizce",
      "lang.en.level": "B2 Orta-Üstü",
      "lang.de.name": "Almanca",
      "lang.de.level": "A1 Başlangıç",
      "skills.title": "Yetenekler & Araçlar",
      "skills.langs": "Diller & Çatılar",
      "skills.tools": "Araçlar & Veritabanları",
      "projects.eyebrow": "Seçili Çalışmalar",
      "projects.title": "Projeler",
      "proj.beansocial.kicker": "Mobil Uygulama · Bitirme Projesi",
      "proj.beansocial.desc":
        "Kahve severlerin tarif paylaştığı, favori demlemelerini kaydettiği ve yeni kahve türlerini keşfettiği bir sosyal platform. Kimlik doğrulama, gerçek zamanlı veri ve durum yönetimi baştan sona kuruldu.",
      "proj.spendly.kicker": "Mobil Uygulama + Backend",
      "proj.spendly.desc":
        "Harcamalarını takip etmeni sağlayan sade, minimal bir gider takip uygulaması. Node.js API ile beslenen Flutter arayüz, tekrarlanabilir kurulum için Docker ile paketlendi.",
      "proj.sentiment.kicker": "Makine Öğrenmesi",
      "proj.sentiment.desc":
        "Film yorumlarını olumlu/olumsuz olarak sınıflandırır. Metin temizleme ve tokenizasyon birden çok modeli (Naive Bayes, Lojistik Regresyon, SVM, Random Forest) besler; doğruluk ve F1 ile karşılaştırılır.",
      "proj.moodaktif.kicker": "Yerel Android",
      "proj.moodaktif.desc":
        "Java ve Android Studio ile yerel olarak geliştirilen; aktivite tabanlı arayüz ve cihaz üzerinde durum yönetimini keşfeden, ruh hâli odaklı bir Android uygulaması.",
      "proj.chart.kicker": "Veri Görselleştirme",
      "proj.chart.desc":
        "Veri okuyup temiz grafiklere döken hafif bir Python aracı; veri kümelerini hızlıca görsel olarak incelemeyi kolaylaştırmak için yapıldı.",
      "btn.caseStudy": "Vaka çalışması",
      "btn.allRepos": "Tüm repoları gör",
      "contact.title": "İletişime Geç",
      "form.name": "Adınız",
      "form.subject": "Konu",
      "form.email": "E-posta",
      "form.message": "Mesajınız",
      "form.send": "Mesaj Gönder",
      "footer.copyright": "Telif © 2025 Kaan Can Kurt. Tüm Hakları Saklıdır.",
      "modal.built": "Neler yaptım",
      "modal.role": "Rolüm",
      "modal.stack": "Teknolojiler",
      "modal.viewGithub": "GitHub'da Gör",
      "modal.liveDemo": "Canlı Demo",
    },
  };

  // Project case-study content (bilingual). tags/links are shared.
  const PROJECTS = {
    beansocial: {
      title: "BeanSocial",
      tags: ["Flutter", "Dart", "GetX", "Firebase"],
      github: "https://github.com/KaanCan1/beansocial_son",
      demo: null,
      en: {
        kicker: "Mobile App · Graduation Project",
        overview:
          "A social platform for coffee lovers to share recipes, save their favorite brews, and discover new types of coffee. Built end to end as my graduation project.",
        role: "Solo project: UI design, full Flutter build, and Firebase backend.",
        highlights: [
          "User accounts and profiles with Firebase Authentication",
          "Create, share and browse coffee recipes",
          "Save favorites and build a personal collection",
          "Real-time data sync with Cloud Firestore",
          "App-wide state handled with GetX",
        ],
      },
      tr: {
        kicker: "Mobil Uygulama · Bitirme Projesi",
        overview:
          "Kahve severlerin tarif paylaştığı, favori demlemelerini kaydettiği ve yeni kahve türlerini keşfettiği bir sosyal platform. Bitirme projem olarak baştan sona geliştirildi.",
        role: "Bireysel proje: arayüz tasarımı, tüm Flutter geliştirmesi ve Firebase backend.",
        highlights: [
          "Firebase Authentication ile kullanıcı hesapları ve profiller",
          "Kahve tarifleri oluşturma, paylaşma ve keşfetme",
          "Favorileri kaydetme ve kişisel koleksiyon oluşturma",
          "Cloud Firestore ile gerçek zamanlı veri senkronizasyonu",
          "Uygulama genelinde GetX ile durum yönetimi",
        ],
      },
    },
    spendly: {
      title: "Spendly",
      tags: ["Flutter", "Dart", "Node.js", "Docker"],
      github: "https://github.com/KaanCan1/Spendly",
      demo: null,
      en: {
        kicker: "Mobile App + Backend",
        overview:
          "A clean, minimal expense tracker that helps you stay on top of your spending: a Flutter client backed by a custom Node.js API and containerized with Docker.",
        role: "Full-stack: Flutter front end, Node.js REST API, and Docker setup.",
        highlights: [
          "Guided onboarding flow",
          "Add and categorize expenses quickly",
          "Weekly summary with a spending chart",
          "Full transaction history and settings",
          "Node.js REST backend, reproducible via Docker Compose",
        ],
      },
      tr: {
        kicker: "Mobil Uygulama + Backend",
        overview:
          "Harcamalarını takip etmeni sağlayan sade, minimal bir gider takip uygulaması: Node.js API ile beslenen Flutter istemci, Docker ile paketlendi.",
        role: "Full-stack: Flutter arayüz, Node.js REST API ve Docker kurulumu.",
        highlights: [
          "Rehberli ilk kullanım (onboarding) akışı",
          "Harcamaları hızlıca ekleme ve kategorize etme",
          "Grafikli haftalık özet",
          "Tam işlem geçmişi ve ayarlar",
          "Docker Compose ile tekrarlanabilir Node.js REST backend",
        ],
      },
    },
    sentiment: {
      title: "Film Review Sentiment Analysis",
      tags: ["Python", "scikit-learn", "NLP", "pandas"],
      github: "https://github.com/KaanCan1/Film-Yorumlari-Duygu-Analizi",
      demo: null,
      en: {
        kicker: "Machine Learning",
        overview:
          "An NLP project that classifies movie reviews as positive or negative, comparing several classic machine-learning models on a labeled review dataset.",
        role: "Group project for an Introduction to Information Engineering course.",
        highlights: [
          "Text cleaning, stop-word removal and tokenization",
          "Trained Naive Bayes, Logistic Regression, SVM and Random Forest",
          "Compared models on accuracy, F1 score and confusion matrix",
          "End-to-end pipeline from raw reviews to evaluation",
        ],
      },
      tr: {
        kicker: "Makine Öğrenmesi",
        overview:
          "Film yorumlarını olumlu veya olumsuz olarak sınıflandıran, birkaç klasik makine öğrenmesi modelini etiketli bir veri kümesinde karşılaştıran bir NLP projesi.",
        role: "Bilişim Mühendisliğine Giriş dersi için grup projesi.",
        highlights: [
          "Metin temizleme, durak kelime ayıklama ve tokenizasyon",
          "Naive Bayes, Lojistik Regresyon, SVM ve Random Forest eğitimi",
          "Modelleri doğruluk, F1 skoru ve hata matrisiyle karşılaştırma",
          "Ham yorumdan değerlendirmeye uçtan uca akış",
        ],
      },
    },
    moodaktif: {
      title: "MoodAktif",
      tags: ["Java", "Android Studio"],
      github: "https://github.com/KaanCan1/MoodAktif",
      demo: null,
      en: {
        kicker: "Native Android",
        overview:
          "A mood-focused Android application built natively with Java and Android Studio.",
        role: "Solo project exploring native Android development.",
        highlights: [
          "Native Android UI built in Java",
          "Activity-based navigation",
          "On-device local state",
        ],
      },
      tr: {
        kicker: "Yerel Android",
        overview:
          "Java ve Android Studio ile yerel olarak geliştirilen, ruh hâli odaklı bir Android uygulaması.",
        role: "Yerel Android geliştirmeyi keşfeden bireysel proje.",
        highlights: [
          "Java ile yazılmış yerel Android arayüzü",
          "Aktivite tabanlı gezinme",
          "Cihaz üzerinde yerel durum",
        ],
      },
    },
    chartplotter: {
      title: "Simple Chart Plotter",
      tags: ["Python", "Matplotlib"],
      github: "https://github.com/KaanCan1/Simple-Chart-Plotter",
      demo: null,
      en: {
        kicker: "Data Visualization",
        overview:
          "A lightweight Python tool for reading data and plotting it into clean charts, made to take the friction out of quick dataset exploration.",
        role: "Solo project.",
        highlights: [
          "Reads input data and renders charts",
          "Fast visual exploration of datasets",
          "Small, focused and easy to run",
        ],
      },
      tr: {
        kicker: "Veri Görselleştirme",
        overview:
          "Veri okuyup temiz grafiklere döken hafif bir Python aracı; veri kümelerini hızlıca incelemeyi kolaylaştırmak için yapıldı.",
        role: "Bireysel proje.",
        highlights: [
          "Girdi verisini okur ve grafik üretir",
          "Veri kümelerini hızlı görsel inceleme",
          "Küçük, odaklı ve çalıştırması kolay",
        ],
      },
    },
  };

  let currentLang = "en";
  let currentModalKey = null;

  /* ----- Apply language ----- */
  function applyLang(lang) {
    if (!I18N[lang]) lang = "en";
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const val = I18N[lang][el.getAttribute("data-i18n")];
      if (val != null) el.textContent = val;
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    localStorage.setItem("lang", lang);
    if (currentModalKey) renderModal(currentModalKey);
  }

  /* ----- Modal ----- */
  const modal = document.getElementById("project-modal");
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

  function renderModal(key) {
    const p = PROJECTS[key];
    if (!p) return;
    const t = p[currentLang] || p.en;
    const dict = I18N[currentLang];

    elKicker.textContent = t.kicker;
    elTitle.textContent = p.title;
    elOverview.textContent = t.overview;

    elHighlights.innerHTML = "";
    t.highlights.forEach(function (h) {
      const li = document.createElement("li");
      li.textContent = h;
      elHighlights.appendChild(li);
    });

    elRole.textContent = t.role;

    elTags.innerHTML = "";
    p.tags.forEach(function (tag) {
      const span = document.createElement("span");
      span.textContent = tag;
      elTags.appendChild(span);
    });

    elActions.innerHTML = "";
    if (p.demo) {
      elActions.appendChild(
        makeLink(p.demo, "github-btn", "fas fa-arrow-up-right-from-square", dict["modal.liveDemo"])
      );
      elActions.appendChild(
        makeLink(p.github, "btn btn-color-2", "fab fa-github", dict["modal.viewGithub"])
      );
    } else {
      elActions.appendChild(
        makeLink(p.github, "github-btn", "fab fa-github", dict["modal.viewGithub"])
      );
    }
  }

  function openModal(key) {
    if (!modal || !PROJECTS[key]) return;
    currentModalKey = key;
    renderModal(key);
    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = modal.querySelector(".project-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    currentModalKey = null;
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

  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ----- Language switch ----- */
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  const savedLang = localStorage.getItem("lang");
  const initialLang =
    savedLang ||
    (navigator.language && navigator.language.toLowerCase().indexOf("tr") === 0
      ? "tr"
      : "en");
  applyLang(initialLang);
});
