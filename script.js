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

  /* ----- Project sliders: auto-advancing filmstrip ----- */
  document.querySelectorAll(".project-slider").forEach(function (slider) {
    const track = slider.querySelector(".project-track");
    const slides = slider.querySelectorAll(".project-slide");
    if (!track || slides.length < 1) return;

    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");
    const dotsWrap = slider.querySelector(".slider-dots");
    const delay = parseInt(slider.dataset.autoplay, 10) || 4800;
    const count = slides.length;

    /* Clone the end shots so the reel can run forward forever: the
       strip never rewinds across every slide to get back to the start. */
    const loop = count > 1;
    if (loop) {
      const head = slides[0].cloneNode(true);
      const tail = slides[count - 1].cloneNode(true);
      [head, tail].forEach(function (clone) {
        clone.setAttribute("aria-hidden", "true");
        clone.classList.add("is-clone");
        const img = clone.querySelector("img");
        if (img) img.removeAttribute("loading");
      });
      track.appendChild(head);
      track.insertBefore(tail, slides[0]);
    }

    let current = 0; /* logical slide the visitor is looking at */
    let pos = loop ? 1 : 0; /* physical offset including the clones */
    let timer = null;
    let visible = false;
    let hovered = false;

    /* Dots are the only progress readout, so build them from the
       actual slide count rather than hard-coding markup. */
    const dots = [];
    if (dotsWrap) {
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider-dot";
        dot.setAttribute("aria-label", "Screenshot " + (i + 1) + " of " + count);
        dot.addEventListener("click", function () {
          goTo(i);
          restart();
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
    }

    function paintDots() {
      dots.forEach(function (dot, i) {
        const on = i === current;
        if (on) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
        dot.classList.remove("animate");
        dot.style.removeProperty("--dur");
        dot.style.setProperty("--fill", on && !canAnimate() ? "1" : "0");
      });
    }

    function canAnimate() {
      return !prefersReducedMotion && count > 1;
    }

    /* Drain the active dot in step with the pending advance. */
    function runDotClock() {
      const dot = dots[current];
      if (!dot || !canAnimate()) return;
      dot.style.setProperty("--dur", delay + "ms");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          dot.classList.add("animate");
          dot.style.setProperty("--fill", "1");
        });
      });
    }

    function place(instant, silent) {
      track.classList.toggle("no-anim", instant === true || prefersReducedMotion);
      track.style.transform = "translate3d(" + -pos * 100 + "%, 0, 0)";
      if (instant === true) {
        /* Flush the un-animated jump before anything re-enables motion. */
        void track.offsetWidth;
        track.classList.toggle("no-anim", prefersReducedMotion);
      }
      /* A clone swap is not a slide change, so leave the dot clock alone. */
      if (silent === true) return;
      slides.forEach(function (slide, i) {
        slide.setAttribute("aria-hidden", i === current ? "false" : "true");
      });
      paintDots();
      if (timer) runDotClock();
    }

    /* Step one frame in either direction, riding through a clone at
       the ends so the motion always continues the same way. */
    function step(dir) {
      current = ((current + dir) % count + count) % count;
      pos += dir;
      place(false);
    }

    function goTo(idx, instant) {
      current = ((idx % count) + count) % count;
      pos = loop ? current + 1 : current;
      place(instant);
    }

    /* Once a clone has finished sliding in, swap to the real slide
       it copies. Same pixels, so the snap is invisible. */
    track.addEventListener("transitionend", function (e) {
      if (e.target !== track || e.propertyName !== "transform" || !loop) return;
      if (pos === count + 1) {
        pos = 1;
        place(true, true);
      } else if (pos === 0) {
        pos = count;
        place(true, true);
      }
    });

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      paintDots();
    }

    function start() {
      /* Only run when the strip is on screen, unattended, and the
         visitor has not asked for reduced motion. */
      if (timer || !canAnimate() || !visible || hovered) return;
      timer = setInterval(function () {
        step(1);
      }, delay);
      runDotClock();
    }

    function restart() {
      stop();
      start();
    }

    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        step(-1);
        restart();
      });

    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        step(1);
        restart();
      });

    /* Pointer and keyboard focus both mean "someone is reading this". */
    ["mouseenter", "focusin"].forEach(function (evt) {
      slider.addEventListener(evt, function () {
        hovered = true;
        stop();
      });
    });

    ["mouseleave", "focusout"].forEach(function (evt) {
      slider.addEventListener(evt, function () {
        if (evt === "focusout" && slider.contains(document.activeElement)) return;
        hovered = false;
        start();
      });
    });

    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
        restart();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
        restart();
      }
    });

    /* Swipe — horizontal drags only, so vertical page scroll is untouched. */
    let startX = 0;
    let startY = 0;
    let tracking = false;

    slider.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
        stop();
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      function (e) {
        if (!tracking) return;
        tracking = false;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          step(dx < 0 ? 1 : -1);
        }
        start();
      },
      { passive: true }
    );

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
          });
        },
        { threshold: 0.35 }
      ).observe(slider);
    } else {
      visible = true;
      start();
    }

    /* Background tabs should not burn through the reel. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    goTo(0, true);
  });

  /* ----- Project demo clips ----- */
  document.querySelectorAll(".project-clip").forEach(function (clip) {
    /* Muted is what makes autoplay permissible; set it in JS too so a
       stripped attribute can't turn the page into a noise source. */
    clip.muted = true;
    clip.setAttribute("muted", "");

    if (prefersReducedMotion) {
      /* Leave the poster up and hand over the controls instead. */
      clip.setAttribute("controls", "");
      clip.setAttribute("preload", "metadata");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      clip.setAttribute("controls", "");
      return;
    }

    /* preload="none" keeps the clip off the wire until it is actually
       scrolled to, so visitors who never reach it pay nothing. */
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const playing = clip.play();
            if (playing && playing.catch) playing.catch(function () {});
          } else {
            clip.pause();
          }
        });
      },
      { threshold: 0.35 }
    ).observe(clip);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clip.pause();
    });
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
      "proj.sepet.kicker": "Mobile App · On-Device OCR + AI",
      "proj.sepet.desc":
        "A Flutter app that builds a personal inflation index from your own grocery receipts and puts it next to the official figures. OCR runs on device, so the photo never leaves the phone; Claude is called only for the receipt lines the matcher is unsure about.",
      "proj.islet.kicker": "macOS App · SwiftUI",
      "proj.islet.desc":
        "A macOS menu bar app that turns the MacBook camera notch into a panel: hover it and it grows into now-playing controls, a pomodoro timer and your Claude Code usage, then disappears when you move away. Players are read over AppleScript rather than private APIs.",
      "proj.tracker.kicker": "Full-Stack Web App · AI Integration",
      "proj.tracker.desc":
        "A self-hosted stock portfolio and swing-trading discipline dashboard. A vanilla JavaScript SPA on top of an Express API and PostgreSQL, with a Claude-powered thesis desk, automated trade audits and an MCP server — the project I use every day.",
      "proj.beansocial.kicker": "Mobile App · Graduation Project",
      "proj.beansocial.desc":
        "A social platform for coffee lovers to share recipes, follow each other, and discover new types of coffee. Flutter client with GetX, backed by my own Express API on PostgreSQL — built end to end.",
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
      "form.sending": "Sending…",
      "form.success": "✅ Your message has been sent. I'll get back to you soon.",
      "form.error":
        "❌ Sending failed. Please try again, or email me at kaancan368368@gmail.com.",
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
      "proj.sepet.kicker": "Mobil Uygulama · Cihaz Üstü OCR + Yapay Zekâ",
      "proj.sepet.desc":
        "Market fişlerinden kendi enflasyonunu hesaplayıp resmî rakamların yanına koyan bir Flutter uygulaması. OCR cihaz üstünde çalışıyor, fişin fotoğrafı telefondan çıkmıyor; Claude yalnızca eşleştirmenin emin olamadığı fiş satırları için devreye giriyor.",
      "proj.islet.kicker": "macOS Uygulaması · SwiftUI",
      "proj.islet.desc":
        "MacBook'un kamera çentiğini bir panele dönüştüren macOS menü çubuğu uygulaması: üstüne gelince çalan parça kontrolleri, pomodoro sayacı ve Claude Code kullanımınla birlikte açılıyor, uzaklaşınca tamamen kayboluyor. Oynatıcılar özel API'ler yerine AppleScript üzerinden okunuyor.",
      "proj.tracker.kicker": "Full-Stack Web Uygulaması · Yapay Zekâ Entegrasyonu",
      "proj.tracker.desc":
        "Kendi sunucumda çalışan bir hisse portföyü ve swing trade disiplin panosu. Express API ve PostgreSQL üzerine kurulu, framework kullanmayan bir JavaScript SPA; Claude destekli tez masası, otomatik işlem denetimi ve bir MCP sunucusu içeriyor — her gün kullandığım proje.",
      "proj.beansocial.kicker": "Mobil Uygulama · Bitirme Projesi",
      "proj.beansocial.desc":
        "Kahve severlerin tarif paylaştığı, birbirini takip ettiği ve yeni kahve türlerini keşfettiği bir sosyal platform. GetX ile yazılmış Flutter istemci, PostgreSQL üzerinde çalışan kendi Express API'mden besleniyor — baştan sona geliştirildi.",
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
      "form.sending": "Gönderiliyor…",
      "form.error":
        "❌ Gönderilemedi. Lütfen tekrar dene ya da kaancan368368@gmail.com adresine yaz.",
      "form.success": "✅ Mesajın ulaştı. En kısa sürede döneceğim.",
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
    sepet: {
      title: "Sepet",
      tags: [
        "Flutter",
        "Dart",
        "Apple Vision OCR",
        "Claude API",
        "Express",
        "PostgreSQL",
      ],
      github: "https://github.com/KaanCan1/Sepet",
      demo: null,
      en: {
        kicker: "Mobile App · On-Device OCR + AI",
        overview:
          "Official inflation measures the price change of one fixed basket meant to represent a whole country — but nobody actually buys that basket. Sepet reads your grocery receipts, builds a price index from the products you really buy, and puts it next to the official TÜİK series without interpreting it. Built solo: product, design, Flutter client, the matching model and the backend it talks to.",
        role: "Solo project: product decisions, design system, Flutter client, receipt normalization pipeline, Node.js/Express + PostgreSQL backend and the CI/release setup.",
        highlights: [
          "Core loop — scan, match, measure, share: photo → on-device OCR → editable draft → saved receipt → your 12-month index",
          "On-device OCR with Apple Vision: the receipt photo never leaves the phone, only matched lines are sent to the server",
          "The heart of the app is the ambiguity case — the server resolves brand and product by fuzzy matching, but a receipt never says whether it was the 1 kg or the 3 kg, so the app asks instead of guessing and shows the unit price each option would feed into the index",
          "Claude is used as an ambiguity resolver only, not per line: confirmed matches are cached per market receipt format, so cost scales with uncertainty instead of with volume",
          "Laspeyres index computed in PostgreSQL functions next to the data — four SQL stages in one transaction — over canonical products, aliases and price observations",
          "Official TÜİK CPI pulled through the TCMB EVDS API — the machine-readable channel, since TÜİK's own portal is closed to automated access — refreshed at most once a month, with manual entry as a fallback when no key is set",
          "Breakdown screen by category and brand, each series reweighted within its own set so the percentages never pretend to add up",
          "Two design layers: paper-receipt content (serif headings, monospace numbers, colour spent only on price hikes) under an iOS 26 Liquid Glass chrome with a floating capsule tab bar",
          "Built for KVKK from the start: separate disclosure and explicit-consent screens per the Board's 2026/347 decision, optional permissions off by default, and a test that asserts no consent toggle exists on the disclosure screen",
          "Green main: protected branch, PR-only flow, squash merges, and CI running format, analyze --fatal-infos, tests with coverage plus Android and iOS builds; tagged releases publish APK + AAB",
          "Flutter version pinned via FVM and read from the same file by CI, so local and CI can't drift",
        ],
      },
      tr: {
        kicker: "Mobil Uygulama · Cihaz Üstü OCR + Yapay Zekâ",
        overview:
          "Resmî enflasyon, bütün bir ülkeyi temsil etmesi beklenen sabit bir sepetin fiyat değişimini ölçüyor — ama kimse tam olarak o sepeti almıyor. Sepet, market fişlerini okuyup fiilen aldığın ürünlerden bir fiyat endeksi kuruyor ve bunu resmî TÜİK serisinin yanına, yorumlamadan koyuyor. Ürün, tasarım, Flutter istemci, eşleştirme modeli ve konuştuğu backend bireysel olarak geliştirildi.",
        role: "Bireysel proje: ürün kararları, tasarım sistemi, Flutter istemci, fiş normalizasyon hattı, Node.js/Express + PostgreSQL backend ve CI/release kurulumu.",
        highlights: [
          "Çekirdek döngü — tara, eşle, ölç, paylaş: fotoğraf → cihaz üstünde OCR → düzeltilebilir taslak → kayıtlı fiş → 12 aylık kendi endeksin",
          "Apple Vision ile cihaz üstü OCR: fişin fotoğrafı telefondan çıkmıyor, sunucuya yalnızca eşleşmiş satırlar gidiyor",
          "Uygulamanın kalbi belirsizlik durumu — marka ve ürünü sunucu bulanık eşleştirmeyle çözüyor, ama 1 kg mı 3 kg mı sorusunun cevabı fişte yazmıyor; uygulama orada tahmin etmiyor, soruyor ve her seçeneğin yanında endekse girecek birim fiyatı gösteriyor",
          "Claude satır başına değil, yalnızca belirsizlik çözücü olarak kullanılıyor: onaylanan eşleşmeler market fiş formatı bazında önbelleğe alınıyor, yani maliyet hacimle değil belirsizlikle ölçekleniyor",
          "Laspeyres endeksi uygulama kodunda değil verinin yanında: kanonik ürünler, alias tablosu ve fiyat gözlemleri üzerinde tek işlemde çalışan dört PostgreSQL fonksiyonu",
          "Resmî TÜİK TÜFE serisi TCMB EVDS API'si üzerinden çekiliyor — TÜİK'in kendi portalı otomatik erişime kapalı olduğu için makine okunur kanal bu; seri ayda en fazla bir kez tazeleniyor, anahtar yoksa aylar elle girilebiliyor",
          "Kategori ve marka kırılımı ekranı: her seri kendi kümesinde yeniden ağırlıklandırılıyor, yani yüzdeler toplanıyormuş gibi yapmıyor",
          "İki tasarım katmanı: kâğıt fiş içeriği (serif başlıklar, monospace sayılar, rengin yalnızca zamlarda harcanması) ve üzerinde yüzen kapsül sekme çubuğuyla iOS 26 Liquid Glass kromu",
          "Baştan KVKK'ya göre kurgulandı: Kurul'un 2026/347 sayılı kararı gereği ayrı aydınlatma ve açık rıza ekranları, varsayılan kapalı isteğe bağlı izinler ve aydınlatma ekranında hiçbir onay anahtarı bulunmadığını doğrulayan bir test",
          "main her zaman yeşil: korumalı dal, yalnızca PR akışı, squash merge ve her PR'da format, analyze --fatal-infos, kapsamlı testler ile Android/iOS derlemelerini çalıştıran CI; etiketli sürümler APK + AAB yayınlıyor",
          "Flutter sürümü FVM ile sabitlenmiş ve CI aynı dosyadan okuyor, böylece yerel ile CI'ın ayrışması mümkün değil",
        ],
      },
    },
    tracker: {
      title: "Portfolio Tracker",
      tags: [
        "JavaScript",
        "Express",
        "PostgreSQL",
        "Claude API",
        "MCP",
        "Node.js",
      ],
      github: "https://github.com/KaanCan1/portfolio-tracker",
      demo: null,
      en: {
        kicker: "Full-Stack Web App · AI Integration",
        overview:
          "A self-hosted stock portfolio and swing-trading discipline dashboard, built end to end as a solo project: product, design, backend, data pipelines and AI integration. Instead of just charting prices, it enforces the trading rules I set for myself — positions without a stop plan get flagged, new entries are blocked when the market regime is bad, and profits trigger a suggestion to pull the initial capital back out.",
        role: "Solo project: product decisions, UI, Express backend, market-data pipelines, scoring engines and the Claude AI layer.",
        highlights: [
          "Vanilla JavaScript SPA with no framework and no build step, talking to a single Express API — 3 runtime dependencies in total",
          "Radar engine: one 0–100 score per ticker from momentum, analyst consensus, fundamentals and insider activity, plus breakout/pullback setup detection and a market-regime gate",
          "Claude thesis desk: an adversarial bull/bear analysis grounded only in the app's own data, returned as structured JSON output (json_schema) and cached per symbol",
          "Deterministic first, LLM second: a rule engine grades every trade of the day and Claude only interprets the evidence pack it produces",
          "Guardian: hourly server-side checks that e-mail alerts for breached stops, concentration limits and zero-cost exit opportunities",
          "Risk desk with correlation matrix, 95% VaR, portfolio beta and a Monte-Carlo net-worth forecast",
          "An MCP server exposing the whole API to Claude Code / Claude Desktop as 6 tools",
          "Provider-agnostic data layer (Finnhub + Twelve Data) with TTL caches sized for free-tier quotas, Postgres persistence and a mock server for dev/prod parity",
        ],
      },
      tr: {
        kicker: "Full-Stack Web Uygulaması · Yapay Zekâ Entegrasyonu",
        overview:
          "Kendi sunucumda çalışan bir hisse portföyü ve swing trade disiplin panosu; ürün, tasarım, backend, veri hatları ve yapay zekâ entegrasyonu dâhil baştan sona bireysel olarak geliştirildi. Sadece fiyat göstermek yerine kendime koyduğum kuralları uyguluyor: stop planı olmayan pozisyonları işaretliyor, piyasa rejimi bozukken yeni girişleri engelliyor ve kâr belirli bir seviyeye ulaştığında ana parayı çekme önerisi çıkarıyor.",
        role: "Bireysel proje: ürün kararları, arayüz, Express backend, piyasa verisi hatları, skorlama motorları ve Claude yapay zekâ katmanı.",
        highlights: [
          "Framework ve build adımı olmayan, tek bir Express API ile konuşan saf JavaScript SPA — toplam 3 çalışma zamanı bağımlılığı",
          "Radar motoru: momentum, analist konsensüsü, temeller ve içeriden işlemlerden hisse başına tek bir 0–100 skoru, kırılım/geri çekilme kurulum tespiti ve piyasa rejimi filtresi",
          "Claude tez masası: yalnızca uygulamanın kendi verisine dayanan boğa/ayı karşıt analizi; yapılandırılmış JSON çıktısı (json_schema) olarak dönüyor ve hisse bazında önbelleğe alınıyor",
          "Önce deterministik, sonra LLM: kural motoru günün her işlemini notlandırıyor, Claude yalnızca üretilen kanıt paketini yorumluyor",
          "Guardian: stop ihlali, yoğunlaşma limiti ve sıfır maliyet fırsatlarında e-posta uyarısı gönderen saatlik sunucu taraflı kontroller",
          "Korelasyon matrisi, %95 VaR, portföy betası ve Monte Carlo net değer projeksiyonu içeren risk masası",
          "Tüm API'yi Claude Code / Claude Desktop'a 6 araç olarak açan bir MCP sunucusu",
          "Sağlayıcıdan bağımsız veri katmanı (Finnhub + Twelve Data), ücretsiz kotalara göre ayarlanmış TTL önbellekleri, Postgres kalıcılığı ve geliştirme/üretim eşitliği için mock sunucu",
        ],
      },
    },
    beansocial: {
      title: "BeanSocial",
      tags: ["Flutter", "Dart", "GetX", "Express", "Prisma", "PostgreSQL"],
      github: "https://github.com/KaanCan1/beansocial_son",
      demo: null,
      en: {
        kicker: "Mobile App · Graduation Project",
        overview:
          "A social platform for coffee lovers to share recipes, follow each other, and discover new types of coffee. Built end to end as my graduation project — Flutter client and a custom REST API, both written from scratch.",
        role: "Solo project: UI design, the full Flutter build, and my own Node.js/Express API with its database schema.",
        highlights: [
          "Custom Express REST API with Prisma over PostgreSQL — users, posts, comments, likes, follows and coffee recipes",
          "Sign-up and login with hashed passwords and JWT-based sessions",
          "Create, share and browse coffee recipes",
          "Social graph: follow other users and interact with their posts",
          "Image uploads handled server-side with multer",
          "App-wide state handled with GetX",
        ],
      },
      tr: {
        kicker: "Mobil Uygulama · Bitirme Projesi",
        overview:
          "Kahve severlerin tarif paylaştığı, birbirini takip ettiği ve yeni kahve türlerini keşfettiği bir sosyal platform. Bitirme projem olarak baştan sona geliştirildi — hem Flutter istemci hem de kendi REST API'm sıfırdan yazıldı.",
        role: "Bireysel proje: arayüz tasarımı, tüm Flutter geliştirmesi ve veritabanı şemasıyla birlikte kendi Node.js/Express API'm.",
        highlights: [
          "PostgreSQL üzerinde Prisma kullanan özel Express REST API — kullanıcı, gönderi, yorum, beğeni, takip ve kahve tarifleri",
          "Hash'lenmiş parolalar ve JWT tabanlı oturumlarla kayıt ve giriş",
          "Kahve tarifleri oluşturma, paylaşma ve keşfetme",
          "Sosyal graf: diğer kullanıcıları takip etme ve gönderileriyle etkileşim",
          "Sunucu tarafında multer ile görsel yükleme",
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

  /* ----- Contact form (EmailJS v4) ----- */
  const contactForm = document.getElementById("contact-form");
  if (contactForm && window.emailjs) {
    emailjs.init({ publicKey: "vOCHwW1SJjORmGB6z" });

    const statusMessage = document.getElementById("status-message");
    const submitBtn = contactForm.querySelector(".form-submit-btn");
    const honeypot = contactForm.querySelector("#website");

    function setStatus(key, kind) {
      statusMessage.className = "status-message";
      statusMessage.textContent = I18N[currentLang][key] || I18N.en[key];
      if (kind) statusMessage.classList.add("show", kind);
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // A bot filled the hidden field — pretend it worked, send nothing.
      if (honeypot && honeypot.value) {
        setStatus("form.success", "success");
        contactForm.reset();
        return;
      }

      submitBtn.disabled = true;
      setStatus("form.sending", null);
      statusMessage.classList.add("show");

      emailjs.sendForm("service_ganvnbc", "template_chyavpa", contactForm).then(
        function () {
          setStatus("form.success", "success");
          contactForm.reset();
          submitBtn.disabled = false;
          setTimeout(function () {
            statusMessage.classList.remove("show", "success");
          }, 6000);
        },
        function (error) {
          setStatus("form.error", "error");
          submitBtn.disabled = false;
          console.error("EmailJS:", error);
          setTimeout(function () {
            statusMessage.classList.remove("show", "error");
          }, 8000);
        }
      );
    });
  }

  // ?lang=tr / ?lang=en wins, so shared links land in the right language
  const urlLang = new URLSearchParams(location.search).get("lang");
  const savedLang = localStorage.getItem("lang");
  const initialLang =
    (urlLang && I18N[urlLang] ? urlLang : null) ||
    savedLang ||
    (navigator.language && navigator.language.toLowerCase().indexOf("tr") === 0
      ? "tr"
      : "en");
  applyLang(initialLang);
});
