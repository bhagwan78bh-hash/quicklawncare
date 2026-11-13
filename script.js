/* ============================================================
   quicklawncare — site behaviour
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function closeMenu() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobileNav.classList.remove("is-open");
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      mobileNav.classList.toggle("is-open", !isOpen);
    });

    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });

    var mq = window.matchMedia("(min-width: 941px)");
    var handleMq = function (e) { if (e.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener("change", handleMq);
    else if (mq.addListener) mq.addListener(handleMq);
  }

  /* ---------- Season tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".season-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".season-panel"));

  function selectSeason(season) {
    tabs.forEach(function (tab) {
      var active = tab.dataset.season === season;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
    panels.forEach(function (panel) {
      var active = panel.id === "panel-" + season;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      selectSeason(tab.dataset.season);
    });
    tab.addEventListener("keydown", function (e) {
      var idx = tabs.indexOf(tab);
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(idx + 1) % tabs.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
        selectSeason(next.dataset.season);
      }
    });
  });

  /* Default to the current season on first load */
  if (tabs.length) {
    var month = new Date().getMonth(); // 0 = Jan
    var season = month <= 1 || month === 11 ? "winter"
      : month <= 4 ? "spring"
      : month <= 7 ? "summer"
      : "autumn";
    selectSeason(season);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll(
    ".section-head, .card, .season, .faq-item, .contact-copy, .contact-form, .quote-inner"
  );

  if ("IntersectionObserver" in window) {
    revealables.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Contact form (front-end demo) ---------- */
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");

  function setNote(message, isError) {
    if (!note) return;
    note.textContent = message;
    note.classList.toggle("is-error", !!isError);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");
      var fields = [name, email, message];
      var valid = true;

      fields.forEach(function (field) {
        field.classList.remove("is-invalid");
        if (!field.value.trim()) {
          field.classList.add("is-invalid");
          valid = false;
        }
      });

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      if (email.value.trim() && !emailOk) {
        email.classList.add("is-invalid");
        valid = false;
      }

      if (!valid) {
        setNote("Please fill in your name, a valid email and a question.", true);
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      setNote("Thanks, " + name.value.trim().split(" ")[0] + "! Your question has been noted. We'll be in touch soon.", false);
      form.reset();
    });
  }
})();
