/* main.js — vanilla, dependency-free. Reveals, header, drawer, parallax,
   countdown, card lightbox, share link. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Scroll reveals (also starts slow zooms) ---------- */
  const revealTargets = $$(".reveal, .reveal-blur, .reveal-mask, .zoom-slow");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Header background after leaving the hero top ---------- */
  const header = $("#site-header");
  const onScrollHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScrollHeader();

  /* ---------- Drawer ---------- */
  const drawer = $("#drawer");
  const scrim = $("#scrim");
  const menuBtn = $("#menu-btn");
  const closeBtn = $("#drawer-close");

  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    (open ? closeBtn : menuBtn).focus({ preventScroll: true });
  };
  menuBtn.addEventListener("click", () => setDrawer(true));
  closeBtn.addEventListener("click", () => setDrawer(false));
  scrim.addEventListener("click", () => setDrawer(false));
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false);
  });

  /* ---------- Selective parallax (interlude only; off for reduced motion) ---------- */
  const parallaxEls = reduceMotion ? [] : $$(".parallax");
  const updateParallax = () => {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const layer = $(".parallax__layer", el);
      if (!layer) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2); // -1..1
      const scale = parseFloat(getComputedStyle(layer).getPropertyValue("--parallax-scale")) || 1.12;
      const maxShift = ((scale - 1) / 2) * rect.height * 0.9; // stays inside the scaled margin
      layer.style.setProperty("--parallax-y", `${(-progress * maxShift).toFixed(1)}px`);
    });
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScrollHeader();
        updateParallax();
        ticking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateParallax, { passive: true });
  updateParallax();

  /* ---------- Countdown to 20 Nov 2026, 09:48 AM IST ---------- */
  const target = new Date("2026-11-20T09:48:00+05:30").getTime();
  const cells = {
    days: $('[data-unit="days"]'),
    hours: $('[data-unit="hours"]'),
    minutes: $('[data-unit="minutes"]'),
    seconds: $('[data-unit="seconds"]'),
  };
  const timer = $("#countdown-timer");
  const done = $("#countdown-done");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    cells.days.textContent = pad(Math.floor(s / 86400));
    cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    cells.seconds.textContent = pad(s % 60);
    if (diff === 0) {
      timer.hidden = true;
      done.hidden = false;
      clearInterval(interval);
    }
  };
  const interval = setInterval(tick, 1000);
  tick();

  /* ---------- Original card lightbox ---------- */
  const lightbox = $("#lightbox");
  const openCard = $("#card-open");
  if (lightbox && typeof lightbox.showModal === "function") {
    openCard.addEventListener("click", () => lightbox.showModal());
    $("#lightbox-close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
  } else {
    openCard.addEventListener("click", () => window.open("assets/img/05_wedding_invitation_card_open-1536.webp", "_blank", "noopener"));
  }

  /* ---------- WhatsApp share (uses the live page URL) ---------- */
  const share = $("#share-whatsapp");
  if (share) {
    const text = `With the blessings of our elders, we invite you to the wedding of Navya & Shivaprasad — Friday, 20 November 2026. ${window.location.href.split("#")[0]}`;
    share.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
})();
