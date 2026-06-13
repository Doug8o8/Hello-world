/* =========================================================
   EVIDENCE — motion choreography
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Reduced motion: show everything, skip the show ---------- */
  if (reduceMotion) {
    document.querySelectorAll("[data-reveal],[data-reveal-eyebrow]").forEach((el) => {
      el.style.opacity = 1;
    });
    runCountUps(true);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll, driven by GSAP ticker ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
    });
  });

  /* =========================================================
     Custom cursor + magnetic elements
     ========================================================= */
  if (!isTouch) {
    const cursor = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    let cx = innerWidth / 2, cy = innerHeight / 2, dx = cx, dy = cy;

    const setC = gsap.quickSetter(cursor, "css");
    const setD = gsap.quickSetter(dot, "css");

    window.addEventListener("mousemove", (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      dx += (cx - dx) * 0.18; dy += (cy - dy) * 0.18;
      setC({ left: dx + "px", top: dy + "px" });
      setD({ left: cx + "px", top: cy + "px" });
    });

    document.querySelectorAll("a, [data-magnetic], .cost__list li, .card, .process__list li")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
      });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));

    // Magnetic pull
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: mx * strength, y: my * strength, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* =========================================================
     1. HERO — signature masked reveal
     ========================================================= */
  const heroLines = gsap.utils.toArray(".hero__title .line__inner");
  gsap.set(heroLines, { yPercent: 115 });

  gsap.set(".hero__thesis", { opacity: 0, y: 24 });

  const heroTl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
  heroTl
    .fromTo(".hero__eyebrow [data-reveal-eyebrow]",
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power2.out" }, 0)
    .to(heroLines, { yPercent: 0, duration: 1.25, stagger: 0.12 }, 0.1)
    .to(".hero__thesis", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 0.7)
    .from(".scrollcue", { opacity: 0, y: 20, duration: 0.9 }, 0.9);

  // Scroll-linked: hero title drifts up & fades, marquee parallax
  gsap.to(".hero__title", {
    yPercent: -18, opacity: 0.35, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to("#heroMarquee", {
    xPercent: -50, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });

  /* =========================================================
     Generic scroll reveals (stagger + easing)
     ========================================================= */
  // Section titles: per-line clip rise
  gsap.utils.toArray("[data-reveal-lines]").forEach((el) => {
    const split = wrapLines(el);
    gsap.set(split, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el, start: "top 82%",
      onEnter: () => gsap.to(split, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }),
    });
  });

  // Simple fade-rise reveals
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.set(el, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: el, start: "top 88%",
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }),
    });
  });

  // Cost rows — staggered slide
  gsap.utils.toArray("[data-cost]").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 60, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      delay: 0,
    });
  });

  // Process rows
  gsap.utils.toArray("[data-process]").forEach((el) => {
    gsap.from(el, {
      opacity: 0, x: -40, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  /* =========================================================
     3. PINNED SEQUENCE — "what a great site does"
     ========================================================= */
  const panels = gsap.utils.toArray(".does__panel");
  const bars = gsap.utils.toArray(".does__progress span");
  const idxEl = document.getElementById("doesIndex");
  let current = 0;

  function activate(i) {
    if (i === current) return;
    panels.forEach((p, n) => {
      const active = n === i;
      p.classList.toggle("is-active", active);
      if (active) {
        gsap.fromTo(p.querySelector("h3"), { yPercent: 8, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
        gsap.fromTo(p.querySelector("p"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.08, ease: "power3.out" });
        gsap.fromTo(p.querySelector(".does__verb"), { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
      }
    });
    bars.forEach((b, n) => {
      b.classList.toggle("is-done", n < i);
      b.classList.toggle("is-active", n === i);
    });
    idxEl.textContent = String(i + 1).padStart(2, "0");
    current = i;
  }

  ScrollTrigger.create({
    trigger: ".does",
    start: "top top",
    end: "+=" + panels.length * 100 + "%",
    pin: ".does__sticky",
    scrub: true,
    onUpdate: (self) => {
      const seg = 1 / panels.length;
      const i = Math.min(panels.length - 1, Math.floor(self.progress / seg));
      activate(i);
      const within = (self.progress - i * seg) / seg;
      if (bars[i]) bars[i].style.setProperty("--p", within.toFixed(3));
    },
  });

  /* =========================================================
     4. STATS — count-ups on enter
     ========================================================= */
  runCountUps(false);

  /* =========================================================
     5. EXPERIENCE — horizontal scroll
     ========================================================= */
  const pin = document.querySelector(".exp__pin");
  if (pin) {
    const getScroll = () => pin.scrollWidth - window.innerWidth;
    gsap.to(pin, {
      x: () => -getScroll(),
      ease: "none",
      scrollTrigger: {
        trigger: ".exp",
        start: "top top",
        end: () => "+=" + getScroll(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }

  /* =========================================================
     7. CLOSING — masked reveal on enter
     ========================================================= */
  const endLines = gsap.utils.toArray(".end__title .line__inner");
  gsap.set(endLines, { yPercent: 115 });
  ScrollTrigger.create({
    trigger: ".end", start: "top 65%",
    onEnter: () => gsap.to(endLines, { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }),
  });

  // Refresh after fonts load to keep pin math honest
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* =========================================================
     Helpers
     ========================================================= */
  function wrapLines(el) {
    // Split on explicit <br> into masked lines
    const html = el.innerHTML;
    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts
      .map((p) => `<span class="rl-line"><span class="rl-inner">${p.trim()}</span></span>`)
      .join("");
    el.querySelectorAll(".rl-line").forEach((l) => {
      l.style.display = "block";
      l.style.overflow = "hidden";
    });
    return Array.from(el.querySelectorAll(".rl-inner")).map((i) => {
      i.style.display = "block";
      i.style.willChange = "transform";
      return i;
    });
  }

  function runCountUps(immediate) {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const end = parseFloat(el.getAttribute("data-count"));
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const render = (v) => {
        el.innerHTML = prefix + Math.round(v) + `<span class="unit">${suffix}</span>`;
      };
      if (immediate) { render(end); return; }
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: () => gsap.to(obj, {
          v: end, duration: 1.8, ease: "power2.out",
          onUpdate: () => render(obj.v),
        }),
      });
    });
  }
})();
