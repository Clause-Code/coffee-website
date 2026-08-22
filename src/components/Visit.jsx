import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { assetV } from '../lib/frames';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { magnetic } from '../lib/reveal';
import { SHOP, storeLink } from '../data/flavors';
import { openStoreSheet } from './StoreModal';

/* ══════════════════════════════════════════════════════════════════════
   Visit — "Come sit a while".

   A single static photograph of the shop, with a slow parallax drift so it
   is not dead still. The scroll-scrubbed walk-in that used to live here has
   been removed: the frame sequence made the section feel like a transition
   to get through rather than a place to arrive at, and the still photo does
   the job better.

   The 49-frame `shop-enter` sequence is still defined in
   pipeline/build_assets.py and can be rebuilt, but it is NOT shipped in the
   bundle any more — no point paying 1.4 MB for frames nothing renders.
   ══════════════════════════════════════════════════════════════════ */

export default function Visit() {
  const ref = useRef(null);
  const bgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const touch = window.matchMedia('(hover: none)').matches;

    const ctx = gsap.context(() => {
      magnetic(ref.current.querySelector('.cta--lg'), 0.3, 120);

      /* slow parallax on the photograph — enough to feel alive, not enough
         to read as an effect */
      if (!touch && bgRef.current) {
        gsap.fromTo(bgRef.current,
          { yPercent: -6, scale: 1.08 },
          {
            yPercent: 6, scale: 1.08, ease: 'none',
            scrollTrigger: {
              trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1.1
            }
          });
      }

      gsap.from('.visit__title', {
        yPercent: 26, opacity: 0, duration: 1.3, ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' }
      });
      gsap.from('.visit__info div', {
        y: 26, opacity: 0, duration: 1.0, stagger: 0.14, ease: 'power3.out',
        scrollTrigger: { trigger: '.visit__info', start: 'top 88%' }
      });
      gsap.from('.visit .cta--lg', {
        y: 20, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.visit__info', start: 'top 80%' }
      });

      /* ambient particles, foreshadowing the footer */
      const cv = canvasRef.current;
      if (!cv) return;
      const c2 = cv.getContext('2d');
      let W, H, dpr, parts = [], run = false, raf;
      const size = () => {
        const r = ref.current.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = r.width; H = r.height;
        cv.width = W * dpr; cv.height = H * dpr;
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        parts = Array.from({ length: Math.round(gsap.utils.clamp(20, 46, W / 36)) }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          r: gsap.utils.random(0.6, 2.0), v: gsap.utils.random(0.10, 0.42),
          d: gsap.utils.random(0, Math.PI * 2), s: gsap.utils.random(0.004, 0.012),
          a: gsap.utils.random(0.10, 0.30)
        }));
      };
      const tick = () => {
        if (!run) return;
        c2.clearRect(0, 0, W, H);
        parts.forEach((p) => {
          p.y -= p.v; p.d += p.s; p.x += Math.sin(p.d) * 0.28;
          if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
          c2.globalAlpha = p.a; c2.fillStyle = '#FFF3E4';
          c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, Math.PI * 2); c2.fill();
        });
        raf = requestAnimationFrame(tick);
      };
      ScrollTrigger.create({
        trigger: ref.current, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => {
          run = self.isActive;
          if (run) { size(); tick(); } else if (raf) cancelAnimationFrame(raf);
        }
      });
      window.addEventListener('resize', size);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="visit" id="visit" ref={ref}>
      <div className="visit__shot">
        <div
          className="visit__bg"
          ref={bgRef}
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/stills/y-yard.webp${assetV()})` }}
          aria-hidden="true"
        />
        <div className="visit__scrim" aria-hidden="true" />
        <canvas className="visit__particles" ref={canvasRef} aria-hidden="true" />

        <div className="visit__body">
          <h2 className="visit__title">Come <em>sit</em> a while</h2>
          <dl className="visit__info">
            <div><dt>Where</dt><dd>{SHOP.area}<br />{SHOP.address.split('\n')[0]}</dd></div>
            <div><dt>Hours</dt><dd>{SHOP.hours.split('\n').map((l) => <span key={l}>{l}<br /></span>)}</dd></div>
            <div><dt>Call</dt><dd><a href={SHOP.phoneHref}>{SHOP.phone}</a></dd></div>
          </dl>
          <div className="visit__ctas">
            <a className="cta cta--lg" href={SHOP.maps} target="_blank" rel="noreferrer noopener" data-cursor="cta">
              <span className="cta__fill" />
              <span className="cta__label">Get directions</span>
            </a>
            <a className="cta cta--lg cta--ghost" href={storeLink()} target="_blank" rel="noreferrer noopener" data-cursor="cta"
              onClick={(e) => { e.preventDefault(); openStoreSheet(); }}>
              <span className="cta__fill" />
              <span className="cta__label">Get the app</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
