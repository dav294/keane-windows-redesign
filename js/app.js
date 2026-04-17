/**
 * Keane Windows & Doors — App.js
 * Lenis smooth scroll + GSAP ScrollTrigger animations
 */
/* ── Lenis Smooth Scroll ──────────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
});

gsap.registerPlugin(ScrollTrigger);

// Wire Lenis to GSAP ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Wire Lenis scroll to ScrollTrigger
lenis.on('scroll', () => {
  ScrollTrigger.update();
});

/* ── Navigation ───────────────────────────────────────────────── */
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

// Scrolled state
ScrollTrigger.create({
  start: 'top -80px',
  onEnter: () => nav.classList.add('scrolled'),
  onLeaveBack: () => nav.classList.remove('scrolled'),
});

// Burger toggle
burger.addEventListener('click', () => {
  mobileNav.classList.add('open');
  lenis.stop();
});
mobileClose.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  lenis.start();
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    lenis.start();
  });
});

/* ── Hero entrance animation ──────────────────────────────────── */
const heroTL = gsap.timeline({ delay: 0.2 });

// Animate each title line
document.querySelectorAll('.ht-line').forEach((line, i) => {
  // Wrap content in inner span for clip reveal
  const inner = document.createElement('span');
  inner.innerHTML = line.innerHTML;
  inner.style.display = 'block';
  inner.style.transform = 'translateY(110%)';
  line.innerHTML = '';
  line.appendChild(inner);

  heroTL.to(inner, {
    y: '0%',
    duration: 1.1,
    ease: 'expo.out',
  }, i * 0.12);
});

heroTL
  .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.1)
  .to('.hero-sub',     { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.45)
  .to('.hero-actions', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.6)
  .to('.hero-trust',   { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.72);

/* ── Section Reveal Helper ────────────────────────────────────── */
// After revealing, we remove the data-reveal attribute and clear GSAP inline
// styles so that CSS hover transforms (translateY on cards etc.) work correctly.
function clearReveal(el) {
  el.removeAttribute('data-reveal');
  gsap.set(el, { clearProps: 'all' });
}

function revealOnScroll(selector, vars = {}) {
  document.querySelectorAll(selector).forEach(el => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: vars.duration || 0.9,
      ease: vars.ease || 'expo.out',
      delay: vars.delay || 0,
      onComplete() { clearReveal(el); },
    });
  });
}

/* ── About Section — slide from sides ────────────────────────── */
revealOnScroll('[data-reveal="left"]',  { duration: 1.1 });
revealOnScroll('[data-reveal="right"]', { duration: 1.1 });

/* ── Problems — clip-path reveal ─────────────────────────────── */
// GSAP owns the clip-path entirely (no CSS clip-path on .problem-card).
// gsap.set below establishes the hidden state immediately so there's no flash.
// fromTo ensures GSAP knows the exact start value and won't misread computed styles.
// On complete we set clipPath:'none' explicitly so the card stays visible.
gsap.set('.problem-card', { clipPath: 'inset(0 0 100% 0)' });

document.querySelectorAll('.problem-card').forEach((card, i) => {
  gsap.fromTo(card,
    { clipPath: 'inset(0 0 100% 0)' },
    {
      scrollTrigger: {
        trigger: card,
        start: 'top 86%',
        once: true,
      },
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.0,
      ease: 'expo.out',
      delay: i * 0.15,
      onComplete() { gsap.set(card, { clipPath: 'none' }); },
    }
  );
});

/* ── Products — scale up stagger ─────────────────────────────── */
document.querySelectorAll('[data-reveal="scale"]').forEach((el, i) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.85,
    ease: 'expo.out',
    delay: (i % 3) * 0.08,
    onComplete() { clearReveal(el); },
  });
});

/* ── Stats — counter animation ───────────────────────────────── */
document.querySelectorAll('[data-reveal="fade"]').forEach((el, i) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'expo.out',
    delay: i * 0.1,
  });
});

// Counter number animation
document.querySelectorAll('.counter').forEach(el => {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || '0');
  const obj = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 2.0,
        ease: 'power3.out',
        onUpdate() {
          el.textContent = obj.val.toFixed(decimals);
        },
      });
    },
  });
});

/* ── Testimonials — cascade from bottom ──────────────────────── */
document.querySelectorAll('[data-reveal="bottom"]').forEach((el, i) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    opacity: 1,
    y: 0,
    duration: 0.85,
    ease: 'expo.out',
    delay: (i % 3) * 0.1,
    onComplete() { clearReveal(el); },
  });
});

/* ── Why Keane — list item stagger ───────────────────────────── */
gsap.set('.why-item', { opacity: 0, x: 30 });
ScrollTrigger.create({
  trigger: '.why-list',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.to('.why-item', {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: 'expo.out',
      stagger: 0.1,
    });
  },
});

/* ── Contact — fade in sections ──────────────────────────────── */
// Already handled by [data-reveal="fade"] above


/* ── Smooth nav anchor links ──────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80, duration: 1.4 });
  });
});

/* ── Product card hover subtle glow ──────────────────────────── */
document.querySelectorAll('.prod-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, { boxShadow: '0 20px 60px rgba(168,129,60,0.12)', duration: 0.35 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.35 });
  });
});

/* ── Parallax on About number ─────────────────────────────────── */
gsap.to('.big-year-num', {
  scrollTrigger: {
    trigger: '.about',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
  },
  y: -40,
  ease: 'none',
});

/* ── Hero title subtle parallax ──────────────────────────────── */
gsap.to('.hero-content', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  },
  y: 80,
  ease: 'none',
});
