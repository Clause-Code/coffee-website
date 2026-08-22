import gsap from 'gsap';

/* Masked character reveal: the old text slides up and out while a duplicate
   slides up and in. This is the site's only link-hover treatment — there is
   no generic opacity fade anywhere. */

function splitChars(text) {
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    s.style.display = 'inline-block';
    s.style.willChange = 'transform';
    frag.appendChild(s);
  });
  return frag;
}

export function wireReveal(link) {
  if (!link || link.dataset.revealReady) return;
  link.dataset.revealReady = '1';
  const base = link.querySelector('span');
  if (!base) return;
  const label = link.dataset.reveal || base.textContent;

  base.textContent = '';
  base.appendChild(splitChars(label));

  const clone = document.createElement('span');
  clone.className = 'clone';
  clone.setAttribute('aria-hidden', 'true');
  clone.appendChild(splitChars(label));
  link.appendChild(clone);

  const a = base.children;
  const b = clone.children;
  gsap.set(b, { yPercent: 100 });
  const stagger = { each: 0.014, from: 'start' };
  const dur = 0.42;
  const ease = 'power3.out';

  link.addEventListener('mouseenter', () => {
    gsap.killTweensOf([a, b]);
    gsap.to(a, { yPercent: -100, duration: dur, ease, stagger });
    gsap.to(b, { yPercent: 0, duration: dur, ease, stagger });
  });
  link.addEventListener('mouseleave', () => {
    gsap.killTweensOf([a, b]);
    gsap.to(a, { yPercent: 0, duration: dur, ease, stagger });
    gsap.to(b, { yPercent: 100, duration: dur, ease, stagger });
  });
}

/** Magnetic hover — the element eases toward the cursor within a radius. */
export function magnetic(el, strength = 0.3, radius = 100) {
  if (!el || window.matchMedia('(hover: none)').matches) return;
  const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < radius + Math.max(r.width, r.height) / 2) {
      xTo(dx * strength);
      yTo(dy * strength);
    }
  });
  el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
}

/** Split an element's text into word spans inside overflow-hidden masks. */
export function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  return words.map((w) => {
    const mask = document.createElement('span');
    mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top';
    const inner = document.createElement('span');
    inner.style.cssText = 'display:inline-block;will-change:transform';
    inner.textContent = w;
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
    return inner;
  });
}
