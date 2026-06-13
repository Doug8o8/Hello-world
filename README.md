# EVIDENCE

A single-page marketing site whose subject is *why a business needs a great website* — and whose method is to **be the proof**. Every claim the copy makes, the page performs in the same breath. It argues by existing.

## Aesthetic direction — Kinetic Brutalist

Structural grids, oversized type treated like architecture, one accent that earns every appearance, real grain. Loud, but disciplined.

- **Type** — [Clash Display](https://www.fontshare.com/fonts/clash-display) (display) paired with [Satoshi](https://www.fontshare.com/fonts/satoshi) (workhorse body), on a strict 1.5 modular scale.
- **Color** — bone paper `#ECE7DA`, ink `#121110`, vermillion accent `#FF3D00`, with a rare electric-blue structural pop. No gradients.
- **Signature moment** — giant headline lines clip-mask up in stagger while an oversized marquee word drifts on scroll; a custom inverting cursor; the whole experience weighted by Lenis smooth scroll.

## Motion

- Hero masked-text reveal + scroll-linked parallax drift
- Scroll-triggered reveals with intentional stagger & easing
- A **pinned scroll sequence** ("what a great site does") that advances panels in a held viewport
- A **horizontal-scroll** experience layer
- Stat **count-ups** on enter
- **Magnetic** buttons/links and a custom cursor
- Full `prefers-reduced-motion` fallback — every section stays legible and ordered with motion removed

## Tech

Hand-built. No framework, no build step.

- [GSAP](https://gsap.com/) + ScrollTrigger — animation & pinning
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scroll
- Fonts via [Fontshare](https://www.fontshare.com/)

All three load from CDN, so the page needs network access on first load.

## Run

It's static. Any server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Drop the directory on any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). No build command, output directory is the repo root.

## Structure

```
index.html      — markup + copy
css/styles.css  — design system + responsive + reduced-motion
js/main.js       — motion choreography
```
