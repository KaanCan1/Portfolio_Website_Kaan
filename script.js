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
