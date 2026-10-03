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
  icon.setAttribute("aria-expanded", open ? "true" : "false");

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
  if (event.key !== "Escape") return;

  const dropdown = document.querySelector(".cv-dropdown");
  if (dropdown) dropdown.classList.remove("open");

  /* Escape is the keyboard equivalent of clicking the backdrop. */
  const menu = document.querySelector(".menu-links");
  if (menu && menu.classList.contains("open")) {
    closeMenu();
    const icon = document.querySelector(".hamburger-icon");
    if (icon) icon.focus();
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

  /* ----- Banner: blurs and dissolves as it scrolls past -----
     One number (--banner-p, 0 -> 1) drives blur, fade and scale; the
     CSS derives the rest. Measured from the band's own position in the
     viewport, not from scrollY, because it sits mid-page. Painted on
     rAF so a fast scroll never queues more work than a frame can take. */
  const heroBanner = document.getElementById("hero-banner");
  let bannerRange = 1;
  let bannerTicking = false;

  function measureBanner() {
    if (!heroBanner) return;
    /* finish dissolving slightly before the band has fully left,
       so what follows arrives to a clean page */
    bannerRange = Math.max(heroBanner.offsetHeight * 0.8, 1);
  }

  function paintBanner() {
    bannerTicking = false;
    if (!heroBanner) return;
    /* sharp until the band starts sliding under the nav, then dissolves */
    const restingTop = mainNav ? mainNav.offsetHeight : 0;
    const travelled = restingTop - heroBanner.getBoundingClientRect().top;
    const p = Math.min(Math.max(travelled / bannerRange, 0), 1);
    heroBanner.style.setProperty("--banner-p", p.toFixed(3));
    /* stop compositing a blurred layer nobody can see */
    heroBanner.style.visibility = p >= 1 ? "hidden" : "";
  }

  function queueBanner() {
    if (bannerTicking) return;
    bannerTicking = true;
    requestAnimationFrame(paintBanner);
  }

  if (heroBanner && !prefersReducedMotion) {
    measureBanner();
    paintBanner();
    window.addEventListener("scroll", queueBanner, { passive: true });
    window.addEventListener("resize", function () {
      measureBanner();
      queueBanner();
    });
    /* the banner image settles the height once it decodes */
    const bannerImg = heroBanner.querySelector(".hero-banner__img");
    if (bannerImg && !bannerImg.complete) {
      bannerImg.addEventListener("load", function () {
        measureBanner();
        queueBanner();
      });
    }
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

    /* If the strip is parked on a clone, swap to the real slide it
       copies. Same pixels, so the snap is invisible. */
    function settle() {
      if (!loop) return;
      if (pos > count) {
        pos -= count;
        place(true, true);
      } else if (pos < 1) {
        pos += count;
        place(true, true);
      }
    }

    /* Step one frame in either direction, riding through a clone at
       the ends so the motion always continues the same way. Settle
       first: a click that interrupts the slide onto a clone gets no
       transitionend, and stepping on from there would run off the
       end of the strip into empty frames. */
    function step(dir) {
      if (!loop) return;
      settle();
      current = ((current + dir) % count + count) % count;
      pos += dir;
      place(false);
      if (prefersReducedMotion) settle();
    }

    function goTo(idx, instant) {
      current = ((idx % count) + count) % count;
      pos = loop ? current + 1 : current;
      place(instant);
    }

    /* Once a clone has finished sliding in, swap to the real slide. */
    track.addEventListener("transitionend", function (e) {
      if (e.target !== track || e.propertyName !== "transform") return;
      settle();
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

  /* ----- Contact animation ----- */
  const contactArt = document.querySelector("lottie-player.contact-art");
  if (contactArt) {
    /* No autoplay attribute in the markup: playback is decided here, so
       reduced-motion visitors get a still frame instead of a loop. */
    /* Do not gate on the player's "ready" event: the library is deferred,
       so it can fire before this listener exists and the animation then
       never starts. play()/pause() are safe to call at any point, and the
       load events only re-sync in case the file lands later. */
    let artInView = false;

    const syncArt = function () {
      if (artInView && !prefersReducedMotion) contactArt.play();
      else contactArt.pause();
    };

    const stopArt = function () {
      contactArt.pause();
    };

    ["ready", "load"].forEach(function (evt) {
      contactArt.addEventListener(evt, syncArt);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            artInView = entry.isIntersecting;
            syncArt();
          });
        },
        { threshold: 0.25 }
      ).observe(contactArt);
    } else {
      artInView = true;
      syncArt();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopArt();
    });
  }

  /* ----- Theme toggle ----- */
  const themeToggle = document.getElementById("theme-toggle");
  const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme") || "dark";
  body.setAttribute("data-theme", savedTheme);

  function updateThemeDisplay(theme) {
    [themeToggle, mobileThemeToggle].filter(Boolean).forEach((toggle) => {
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
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

  /* These are real <button>s now: Enter and Space fire click natively, and
     the label lives in the markup. The old tabindex/role/keydown shim would
     double-fire the toggle on Enter, so it is gone. */
  [themeToggle, mobileThemeToggle].filter(Boolean).forEach((toggle) => {
    toggle.addEventListener("click", toggleTheme);
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
      "hero.identity": "Kaan Can Kurt · Data & Backend",
      "hero.line1": "Data.",
      "hero.line2": "Systems.",
      "hero.line3": "Products.",
      "hero.projectsBtn": "Explore projects",
      "hero.aboutBtn": "About me ↗",
      "hero.role": "Data & Backend Developer",
      "hero.lead": "I turn reliable systems into products people want to use.",
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
      "lang.de.level": "A2 Elementary",
      "skills.title": "Skills & Tools",
      "skills.langs": "Languages & Tools",
      "skills.tools": "Data & Databases",
      "projects.eyebrow": "Selected Work",
      "projects.title": "Selected projects.",
      "projects.intro": "Working products first. The systems behind them follow.",
      "proj.openbasket.kicker": "Mobile App · BuilderBase Hackathon · Two-person team",
      "proj.openbasket.desc":
        "A live shared shopping basket for families and housemates. Everyone adds items while one person shops; the server closes the basket on time and calculates who owes whom at checkout. Built by a two-person team for the BuilderBase Serverpod Hackathon.",
      "proj.openbasket.demo": "Try the app",
      "proj.sepet.kicker": "Mobile App · On-Device OCR + AI",
      "proj.sepet.desc":
        "A Flutter app that builds a personal inflation index from your own grocery receipts and puts it next to the official figures. OCR runs on device, so the photo never leaves the phone; Claude is called only for the receipt lines the matcher is unsure about.",
      "proj.islet.kicker": "macOS App · SwiftUI",
      "proj.islet.desc":
        "A macOS menu bar app that turns the MacBook camera notch into a panel: hover it and it grows into now-playing controls, a screenshot shelf, a pomodoro timer, a posture tab and your Claude Code usage, then disappears when you move away. Players are read over AppleScript rather than private APIs.",
      "proj.tracker.kicker": "Full-Stack Web App · AI Integration",
      "proj.tracker.desc":
        "A self-hosted stock portfolio and swing-trading discipline dashboard. A vanilla JavaScript SPA on top of an Express API and PostgreSQL, with a Claude-powered thesis desk, automated trade audits and an MCP server — the project I use every day.",
      "proj.beansocial.kicker": "Mobile App · Graduation Project",
      "proj.beansocial.desc":
        "A social platform for coffee lovers to share recipes, follow each other, and discover new types of coffee. Flutter client with GetX, backed by my own Express API on PostgreSQL — built end to end.",
      "proj.spendly.kicker": "iOS App",
      "proj.spendly.desc":
        "A minimal expense tracker for iPhone: type the amount, tap a category, and it is saved. Works offline with no account, and expenses can be logged from a home screen widget or with Siri.",
      "proj.sentiment.kicker": "Machine Learning",
      "proj.sentiment.desc":
        "Classifies Turkish movie reviews as positive or negative. Reviews are cleaned (emoji turned into words, stop words removed), turned into 1–3-gram bag-of-words vectors and fed to a regularised Keras neural network.",
      "proj.sentiment.panelCount": "5,000 labelled reviews",
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
      "modal.built": "Highlights",
      "modal.role": "Role / team",
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
      "hero.identity": "Kaan Can Kurt · Veri & Backend",
      "hero.line1": "Veri.",
      "hero.line2": "Altyapı.",
      "hero.line3": "Ürün.",
      "hero.projectsBtn": "Projeleri gör",
      "hero.aboutBtn": "Hakkımda ↗",
      "hero.role": "Veri & Backend Geliştirici",
      "hero.lead": "Güvenilir sistemleri, insanların kullanmak isteyeceği ürünlere dönüştürüyorum.",
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
      "lang.de.level": "A2 Temel",
      "skills.title": "Yetenekler & Araçlar",
      "skills.langs": "Diller & Araçlar",
      "skills.tools": "Veri & Veritabanı",
      "projects.eyebrow": "Seçili Çalışmalar",
      "projects.title": "Yaptığım işler.",
      "projects.intro": "Önce çalışan ürünler. Sonra onları mümkün kılan teknoloji.",
      "proj.openbasket.kicker": "Mobil Uygulama · BuilderBase Hackathon · İki kişilik ekip",
      "proj.openbasket.desc":
        "Aileler ve ev arkadaşları için canlı, ortak alışveriş sepeti. Bir kişi alışveriş yaparken herkes ürün ekleyebiliyor; sepeti sunucu süresi dolunca kapatıyor ve kasada kimin kime ne kadar borçlu olduğunu hesaplıyor. BuilderBase Serverpod Hackathon için iki kişilik ekiple geliştirildi.",
      "proj.openbasket.demo": "Uygulamayı dene",
      "proj.sepet.kicker": "Mobil Uygulama · Cihaz Üstü OCR + Yapay Zekâ",
      "proj.sepet.desc":
        "Market fişlerinden kendi enflasyonunu hesaplayıp resmî rakamların yanına koyan bir Flutter uygulaması. OCR cihaz üstünde çalışıyor, fişin fotoğrafı telefondan çıkmıyor; Claude yalnızca eşleştirmenin emin olamadığı fiş satırları için devreye giriyor.",
      "proj.islet.kicker": "macOS Uygulaması · SwiftUI",
      "proj.islet.desc":
        "MacBook'un kamera çentiğini bir panele dönüştüren macOS menü çubuğu uygulaması: üstüne gelince çalan parça kontrolleri, ekran görüntüsü rafı, pomodoro sayacı, duruş sekmesi ve Claude Code kullanımınla birlikte açılıyor, uzaklaşınca tamamen kayboluyor. Oynatıcılar özel API'ler yerine AppleScript üzerinden okunuyor.",
      "proj.tracker.kicker": "Full-Stack Web Uygulaması · Yapay Zekâ Entegrasyonu",
      "proj.tracker.desc":
        "Kendi sunucumda çalışan bir hisse portföyü ve swing trade disiplin panosu. Express API ve PostgreSQL üzerine kurulu, framework kullanmayan bir JavaScript SPA; Claude destekli tez masası, otomatik işlem denetimi ve bir MCP sunucusu içeriyor — her gün kullandığım proje.",
      "proj.beansocial.kicker": "Mobil Uygulama · Bitirme Projesi",
      "proj.beansocial.desc":
        "Kahve severlerin tarif paylaştığı, birbirini takip ettiği ve yeni kahve türlerini keşfettiği bir sosyal platform. GetX ile yazılmış Flutter istemci, PostgreSQL üzerinde çalışan kendi Express API'mden besleniyor — baştan sona geliştirildi.",
      "proj.spendly.kicker": "iOS Uygulaması",
      "proj.spendly.desc":
        "iPhone için minimal bir gider takip uygulaması: tutarı yaz, kategoriye dokun, kaydedilsin. Hesap gerektirmeden çevrimdışı çalışır; harcamalar ana ekran widget'ından veya Siri ile de girilebilir.",
      "proj.sentiment.kicker": "Makine Öğrenmesi",
      "proj.sentiment.desc":
        "Türkçe film yorumlarını olumlu/olumsuz olarak sınıflandırır. Yorumlar temizlenir (emojiler kelimeye çevrilir, durak kelimeler ayıklanır), 1–3 gramlık kelime torbası vektörlerine dönüştürülür ve düzenlileştirilmiş bir Keras sinir ağına verilir.",
      "proj.sentiment.panelCount": "5.000 etiketli yorum",
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
      "modal.built": "Öne çıkanlar",
      "modal.role": "Rol / ekip",
      "modal.stack": "Teknolojiler",
      "modal.viewGithub": "GitHub'da Gör",
      "modal.liveDemo": "Canlı Demo",
    },
  };

  // Project case-study content (bilingual). tags/links are shared.
  const PROJECTS = {
    openbasket: {
      title: "Open Basket",
      tags: ["Flutter", "Dart", "Serverpod", "PostgreSQL", "WebSocket"],
      github: "https://github.com/KaanCan1/Open-Basket",
      demo: "https://open-basket.serverpod.space/",
      eventImage: "./assets/open-basket-hackathon.png",
      en: {
        kicker: "Mobile App · BuilderBase Hackathon · Two-person team",
        overview: "One person shops; everyone adds. Open Basket lets a household share a shopping basket for a set time, then settles the receipt so each member can see what they owe. Built as a two-person project for BuilderBase's Build Something Real: The Serverpod Hackathon.",
        role: "Two-person team project. The team delivered the Flutter client and Serverpod backend, coordinating through shared product rules, a build plan and architecture decisions.",
        eventCaption: "Built for BuilderBase's Build Something Real: The Serverpod Hackathon.",
        eventAlt: "BuilderBase page for Build Something Real: The Serverpod Hackathon",
        highlights: [
          "The shopper opens a timed basket for a store; household members add items and notes that appear on every connected device through a Serverpod stream.",
          "A Serverpod future call closes the basket at its deadline even when the phones are offline. Only the shopper can extend it once by five minutes.",
          "At checkout, the shopper marks found items and enters prices and the receipt total; the server calculates each member's share in integer currency units.",
          "Passwordless email sign-in, household roles, completed-run history and a PostgreSQL-backed typed Dart client complete the full-stack flow.",
          "Walking-time suggestions are calculated on the phone; live location is never sent to the server."
        ]
      },
      tr: {
        kicker: "Mobil Uygulama · BuilderBase Hackathon · İki kişilik ekip",
        overview: "Bir kişi alışveriş yapar, herkes sepete ekler. Open Basket, ev halkının belirli süre açık kalan ortak bir alışveriş sepeti kullanmasını ve fişin sonunda herkesin borcunu görmesini sağlar. BuilderBase'in Build Something Real: The Serverpod Hackathon etkinliği için iki kişilik ekiple geliştirildi.",
        role: "İki kişilik ekip projesi. Ekip, Flutter istemciyi ve Serverpod backend'i ortak ürün kuralları, geliştirme planı ve mimari karar kayıtları üzerinden koordine ederek geliştirdi.",
        eventCaption: "BuilderBase'in Build Something Real: The Serverpod Hackathon etkinliği için geliştirildi.",
        eventAlt: "Build Something Real: The Serverpod Hackathon için BuilderBase sayfası",
        highlights: [
          "Alışverişi yapan kişi mağaza için süreli sepet açar; ev üyelerinin eklediği ürün ve notlar Serverpod akışıyla bağlı cihazlarda anında görünür.",
          "Serverpod future call, telefonlar çevrimdışıyken bile süresi dolan sepeti kapatır. Süreyi yalnızca alışverişi yapan kişi bir kez, beş dakika uzatabilir.",
          "Kasada bulunan ürünler işaretlenir, fiyatlar ve fiş toplamı girilir; sunucu herkesin payını kuruş bazında hesaplar.",
          "E-posta koduyla şifresiz giriş, hane rolleri, tamamlanan alışveriş geçmişi ve PostgreSQL tabanlı tipli Dart istemcisi tam akışı oluşturur.",
          "Yürüme süresi önerisi telefonda hesaplanır; canlı konum sunucuya gönderilmez."
        ]
      }
    },
    islet: {
      title: "Islet",
      tags: ["Swift", "SwiftUI", "macOS", "AppleScript", "Claude API"],
      github: "https://github.com/KaanCan1/Islet",
      demo: null,
      en: {
        kicker: "macOS App · SwiftUI",
        overview:
          "A macOS menu bar app that treats the MacBook camera notch as a control surface: hover it and it grows into a panel, move away and it disappears completely. Five panels live there — what is playing, the screenshots you have just taken, a pomodoro timer, how far your head is tipped forward of upright, and how much of the current Claude Code block is spent. Built solo in Swift and SwiftUI.",
        role: "Solo project: product decisions, SwiftUI interface, the notch and screen geometry, player integration, the screenshot shelf, the AirPods posture model, the Claude usage reader, and the install tooling.",
        highlights: [
          "Hover target sits over the notch itself, with a virtual one at the top centre on displays that have none",
          "Five panels behind one gesture — music, screenshot shelf, pomodoro, posture and Claude usage — and the settings menu opens from the panel too, because a notch halves the menu bar and macOS quietly hides the status items that no longer fit",
          "Music column reads Spotify and Apple Music over AppleScript, not private APIs — macOS 15.4 closed MediaRemote to unentitled apps",
          "Screenshot shelf catches a capture the moment it is written: it watches whichever folder com.apple.screencapture points at and only accepts files screencapture stamped with the kMDItemIsScreenCapture attribute, so nothing else on the Desktop counts and no Spotlight query is involved",
          "The shelf stores references, never copies — the last four survive a restart, drag straight out into Finder or a mail draft, and drop off on their own if you move or delete the file; macOS's own thumbnail cannot be dragged once it has faded",
          "Posture reads head angle from AirPods against a calibrated upright rather than the sensor's zero: a level head reports about −15°, so measuring from zero would call you slouched before you had moved",
          "A nudge only fires after ninety seconds past the threshold within any three-minute window, then ten minutes of quiet — at a desk the angle crosses the line constantly, so a rule demanding one unbroken run would track perfectly and never speak",
          "Claude column reads real usage from the OAuth token the claude CLI keeps in the login keychain, renewing it and writing the rotated pair back so reading your own figures cannot log you out of Claude Code; without it, usage is estimated from local transcripts and the panel always labels which of the two you are looking at",
          "The estimate is honest about its error bars: nothing on disk states the account limits, so the ceiling is learned from the moments Claude actually cut you off — counting tokens against the median of those, a rule picked by replaying this machine's own rejections (median-of-tokens is out by 21 points on average, the minutes-and-largest it replaced by 42)",
          "Transcript scanning is incremental and runs off the main thread — only the first pass is slow, then it refreshes every minute — and Islet asks before reading anything under ~/.claude, because macOS does not gate that directory itself",
          "Pomodoro with Focus and Break modes, battery alerts on charger changes, and an option to stay visible on the lock screen",
          "Ships as a menu bar app with no Dock icon; make install builds it, copies it to /Applications and launches it",
        ],
      },
      tr: {
        kicker: "macOS Uygulaması · SwiftUI",
        overview:
          "MacBook'un kamera çentiğini bir kontrol yüzeyine çeviren macOS menü çubuğu uygulaması: üstüne gelince panel olarak açılıyor, uzaklaşınca tamamen kayboluyor. Panelde beş sekme var — çalan parça, az önce aldığın ekran görüntüleri, pomodoro sayacı, başının dik duruştan ne kadar öne eğik olduğu ve içinde bulunduğun Claude Code bloğunun ne kadarını harcadığın. Swift ve SwiftUI ile tek başıma geliştirildi.",
        role: "Tek kişilik proje: ürün kararları, SwiftUI arayüzü, çentik ve ekran geometrisi, oynatıcı entegrasyonu, ekran görüntüsü rafı, AirPods duruş modeli, Claude kullanım okuyucusu ve kurulum araçları.",
        highlights: [
          "Etkileşim alanı doğrudan çentiğin üzerinde; çentiği olmayan ekranlarda üst ortaya sanal bir çentik yerleştiriliyor",
          "Tek bir hareketin arkasında beş sekme — müzik, ekran görüntüsü rafı, pomodoro, duruş ve Claude kullanımı — ayarlar menüsü panelin kendisinden de açılıyor: çentik menü çubuğunu ikiye böldüğü için macOS sığmayan durum ikonlarını sessizce gizliyor",
          "Müzik sütunu Spotify ve Apple Music'i özel API'ler yerine AppleScript üzerinden okuyor — macOS 15.4 MediaRemote'u yetkisiz uygulamalara kapattı",
          "Ekran görüntüsü rafı görüntüyü diske yazıldığı anda yakalıyor: com.apple.screencapture'ın gösterdiği klasörü izliyor ve yalnızca screencapture'ın kMDItemIsScreenCapture özniteliğiyle damgaladığı dosyaları kabul ediyor — masaüstündeki diğer hiçbir şey sayılmıyor, Spotlight sorgusu da kullanılmıyor",
          "Raf kopya değil referans tutuyor: son dört görüntü yeniden başlatmadan sonra da duruyor, doğrudan Finder'a veya bir e-posta taslağına sürüklenebiliyor, dosyayı taşırsan ya da silersen kendiliğinden düşüyor; macOS'un kendi küçük resmi soluklaştıktan sonra sürüklenemiyor",
          "Duruş, AirPods'tan gelen baş açısını sensörün sıfırına göre değil kalibre edilmiş bir dikliğe göre ölçüyor: düz duran bir baş yaklaşık −15° okuyor, yani sıfırdan ölçmek sen daha kıpırdamadan seni kambur ilan ederdi",
          "Uyarı ancak açı, herhangi bir üç dakikalık pencerede toplam doksan saniye eşiğin üzerinde kaldığında çıkıyor ve ardından on dakika susuyor — masa başında açı sürekli sınırı geçtiği için kesintisiz tek bir seri isteyen kural mükemmel çalışır ve hiç konuşmazdı",
          "Claude sütunu, claude CLI'ın login keychain'inde tuttuğu OAuth token'ı ile hesabın gerçek kullanımını okuyor; token'ı yenileyip dönen çifti geri yazıyor, böylece kendi rakamlarını okumak seni Claude Code'dan düşürmüyor. Token yoksa kullanım yerel transkriptlerden tahmin ediliyor ve panel hangisine baktığını her zaman yazıyor",
          "Tahmin hata payı konusunda dürüst: diskte hesabın limitini belirten bir bilgi yok, tavan yalnızca Claude'un gerçekten kestiği anlardan öğreniliyor — token sayıp bu anların medyanını almak, bu makinenin kendi retleri yeniden oynatılarak seçildi (medyan-token ortalama 21 puan, yerine geçtiği dakika-say-en-büyüğünü-al 42 puan sapıyor)",
          "Transkript taraması artımlı ve arka planda çalışıyor — yalnızca ilk geçiş yavaş, sonrasında dakikada bir tazeleniyor — ve ~/.claude altındaki hiçbir şey sorulmadan okunmuyor; macOS bu dizini kendisi korumadığı için izni uygulama kendi istiyor",
          "Focus ve Break modlu pomodoro, şarj değişiminde pil uyarıları ve kilit ekranında görünür kalma seçeneği",
          "Dock ikonu olmayan bir menü çubuğu uygulaması; make install derleyip /Applications'a kopyalıyor ve başlatıyor",
        ],
      },
    },
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
      tags: ["Swift", "SwiftUI", "SwiftData", "WidgetKit", "App Intents", "StoreKit 2"],
      github: "https://github.com/KaanCan1/Spendly",
      demo: null,
      en: {
        kicker: "iOS App",
        overview:
          "A minimal expense tracker for iPhone that focuses on one thing: logging an expense in a few seconds. The app opens on the keypad, works offline and needs no account.",
        role: "Solo project: SwiftUI app, widgets and Siri support, with shared logic in a Swift package. No backend; the app, widgets and Siri share one local SwiftData store.",
        highlights: [
          "Two-tap logging with undo, plus a suggestion to repeat your usual expense",
          "Income entries and logging for past days",
          "Your own categories with a name, emoji and color, and a monthly overview by category",
          "Monthly budget per category, with a notification at 80% and 100%",
          "Home screen and lock screen widgets, a Control Center button, and Siri and Shortcuts support",
          "English and Turkish, plus Spendly Pro through StoreKit 2 for unlimited categories and budgets and CSV export",
        ],
      },
      tr: {
        kicker: "iOS Uygulaması",
        overview:
          "Tek bir işe odaklanan, iPhone için minimal bir gider takip uygulaması: bir harcamayı birkaç saniyede kaydetmek. Uygulama doğrudan tuş takımıyla açılır, çevrimdışı çalışır ve hesap gerektirmez.",
        role: "Tek kişilik proje: SwiftUI uygulaması, widget'lar ve Siri desteği; ortak mantık bir Swift paketinde. Backend yok; uygulama, widget'lar ve Siri aynı yerel SwiftData deposunu paylaşır.",
        highlights: [
          "Geri alınabilen iki dokunuşla kayıt ve her zamanki harcamayı tekrarlama önerisi",
          "Gelir girişi ve geçmiş günlere kayıt",
          "İsim, emoji ve renkle kendi kategorilerini oluşturma ve kategori bazında aylık özet",
          "Kategori başına aylık bütçe; %80 ve %100'de bildirim",
          "Ana ekran ve kilit ekranı widget'ları, Denetim Merkezi düğmesi, Siri ve Kestirmeler desteği",
          "İngilizce ve Türkçe dil desteği; StoreKit 2 ile Spendly Pro: sınırsız kategori ve bütçe, CSV dışa aktarma",
        ],
      },
    },
    sentiment: {
      title: "Film Review Sentiment Analysis",
      tags: ["Python", "TensorFlow / Keras", "scikit-learn", "NLTK", "pandas"],
      github: "https://github.com/KaanCan1/Film-Yorumlari-Duygu-Analizi",
      demo: null,
      en: {
        kicker: "Machine Learning",
        overview:
          "An NLP project that classifies Turkish movie reviews as positive or negative, training a small Keras neural network on 5,000 labelled reviews.",
        role: "Group project for an Introduction to Knowledge Engineering course.",
        highlights: [
          "Cleaning: HTML and links stripped, emoji turned into Turkish words, NLTK stop words removed",
          "1–3-gram bag-of-words features with scikit-learn's CountVectorizer",
          "Dense 128-64-32-16 network with L2 regularisation, dropout and early stopping",
          "80/20 train/test split, test accuracy and loss/accuracy curves, plus live prediction for a typed review",
        ],
      },
      tr: {
        kicker: "Makine Öğrenmesi",
        overview:
          "Türkçe film yorumlarını olumlu veya olumsuz olarak sınıflandıran, 5.000 etiketli yorumla küçük bir Keras sinir ağı eğiten bir NLP projesi.",
        role: "Bilgi Mühendisliğine Giriş dersi için grup projesi.",
        highlights: [
          "Temizleme: HTML ve linkler silinir, emojiler Türkçe kelimeye çevrilir, NLTK durak kelimeleri ayıklanır",
          "scikit-learn CountVectorizer ile 1–3 gramlık kelime torbası özellikleri",
          "L2 düzenlileştirme, dropout ve erken durdurmalı 128-64-32-16 yoğun katmanlı ağ",
          "%80/%20 eğitim/test ayrımı, test doğruluğu ve kayıp/doğruluk grafikleri, yazılan yoruma canlı tahmin",
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
  const elEvent = document.getElementById("pm-event");
  const elEventImage = document.getElementById("pm-event-image");
  const elEventCaption = document.getElementById("pm-event-caption");
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
    elEvent.hidden = !p.eventImage;
    if (p.eventImage) {
      elEventImage.src = p.eventImage;
      elEventImage.alt = t.eventAlt;
      elEventCaption.textContent = t.eventCaption;
    } else {
      elEventImage.removeAttribute("src");
      elEventImage.alt = "";
      elEventCaption.textContent = "";
    }

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
