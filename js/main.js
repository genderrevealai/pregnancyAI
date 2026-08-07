// Mobile nav
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  // Get the App modal
  const ctaButtons = document.querySelectorAll('.nav-cta, a[href$="#download"]');
  if (ctaButtons.length) {
    const modal = document.createElement("div");
    modal.className = "app-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "app-modal-title");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="app-modal-card">
        <button class="app-modal-close" aria-label="Close">&times;</button>
        <span class="app-modal-eyebrow">Pregnancy AI</span>
        <h3 class="app-modal-title" id="app-modal-title">Download the app</h3>
        <p class="app-modal-text">Choose your store to get Lola, scan predictions, and the full toolkit on your phone.</p>
        <div class="store-badges">
          <a class="store-badge" href="https://apps.apple.com/app/pregnancy-ai/id6748532899" target="_blank" rel="noopener" aria-label="Download on the App Store">
            <svg class="store-badge-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/></svg>
            <span class="store-badge-text">
              <span class="store-badge-small">Download on the</span>
              <span class="store-badge-name">App Store</span>
            </span>
          </a>
          <a class="store-badge" href="https://play.google.com/store/apps/details?id=com.babyworld.pregnancyai" target="_blank" rel="noopener" aria-label="Get it on Google Play">
            <svg class="store-badge-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.198-3.198l2.553 1.479c.832.482.832 1.682 0 2.165l-2.552 1.479L15.155 12l2.542-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302L5.864 2.658z"/></svg>
            <span class="store-badge-text">
              <span class="store-badge-small">Get it on</span>
              <span class="store-badge-name">Google Play</span>
            </span>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const openModal = () => {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    ctaButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (links && links.classList.contains("open")) links.classList.remove("open");
        openModal();
      });
    });

    modal.querySelector(".app-modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
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
