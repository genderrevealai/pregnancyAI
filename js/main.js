// Mobile nav
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  // Dropdown
  document.querySelectorAll(".nav-dropdown").forEach((dd) => {
    const btn = dd.querySelector(".nav-dropdown-toggle");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dd.classList.toggle("open");
      document.querySelectorAll(".nav-dropdown").forEach((other) => {
        if (other !== dd) other.classList.remove("open");
      });
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown").forEach((dd) => dd.classList.remove("open"));
  });

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-question");
    if (!q) return;
    q.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });

  // Blog category filter
  const chips = document.querySelectorAll(".category-chip");
  const cards = document.querySelectorAll(".blog-card");
  if (chips.length && cards.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const cat = chip.dataset.category;
        chips.forEach((c) => c.classList.toggle("is-active", c === chip));
        cards.forEach((card) => {
          const show = cat === "all" || card.dataset.category === cat;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  // Contact form (demo)
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      if (status) {
        status.textContent = "Thanks — we'll be in touch within 1 business day.";
        status.style.color = "var(--accent-sage)";
      }
      form.reset();
    });
  }
});
