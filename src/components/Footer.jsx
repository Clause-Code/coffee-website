import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getSequence, hasSeq } from '../lib/frames';
import { SHOP, ORDER, storeLink } from '../data/flavors';

/* Closing scene. If the pour-drain sequence exists it is scroll-scrubbed on
   a canvas; until those plates are shot, a drifting particle field keeps the
   footer from sitting static. */
const COLS = [
  { lab: 'Find us', links: [
      { t: SHOP.area, href: SHOP.maps },
      { t: 'Near Innovation Street, University City', href: SHOP.maps }
  ] },
  { lab: 'Talk to us', links: [
      { t: SHOP.phone, href: SHOP.phoneHref },
      { t: 'Get the Drivu app', href: storeLink() }
  ] },
  { lab: 'Follow', links: [
      { t: '@the.yard.ae', href: ORDER.instagram },
      { t: `${SHOP.rating} on Google · ${SHOP.reviewCount} reviews`, href: SHOP.maps }
  ] }
];

export default function Footer() {
  const ref = useRef(null);
  const pourRef = useRef(null);
  const steamRef = useRef(null);

  useEffect(() => {
    const footer = ref.current;
    const touch = window.matchMedia('(hover: none)').matches;
    const ctx = gsap.context(() => {
      gsap.set('.fw > span', { yPercent: 108 });
      gsap.to('.fw > span', {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.11,
        scrollTrigger: { trigger: '.footer__reveal', start: 'top 88%' }
      });
      gsap.from('.footer__col', {
        y: 34, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.footer__cols', start: 'top 92%' }
      });

      const cv = pourRef.current;
      if (cv && hasSeq('pour-drain')) {
        const seq = getSequence('pour-drain', cv);
        ScrollTrigger.create({
          trigger: footer, start: 'top bottom+=60%', once: true,
          onEnter: () => seq.load().then(() => { seq.size(); seq.draw(0); })
        });
        const fr = { i: 0 };
        gsap.to(fr, {
          i: () => Math.max(0, seq.count - 1), ease: 'none',
          onUpdate: () => seq.draw(Math.round(fr.i)),
          scrollTrigger: {
            trigger: footer, start: 'top 78%',
            end: touch ? 'top 8%' : 'top -12%', scrub: true, invalidateOnRefresh: true
          }
        });
      } else if (cv) {
        cv.style.display = 'none';
      }

      /* ambient particle field so the footer is never static */
      const sc = steamRef.current;
      if (!sc) return;
      const c2 = sc.getContext('2d');
      let W, H, dpr, parts = [], run = false, raf;
      const size = () => {
        const r = footer.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = r.width; H = r.height;
        sc.width = W * dpr; sc.height = H * dpr;
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        parts = Array.from({ length: 40 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          r: gsap.utils.random(20, 90), v: gsap.utils.random(0.08, 0.3),
          a: gsap.utils.random(0.02, 0.07)
        }));
      };
      const tick = () => {
        if (!run) return;
        c2.clearRect(0, 0, W, H);
        parts.forEach((p) => {
          p.y -= p.v;
          if (p.y < -p.r) { p.y = H + p.r; p.x = Math.random() * W; }
          const g = c2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(255,240,225,${p.a})`);
          g.addColorStop(1, 'rgba(255,240,225,0)');
          c2.fillStyle = g;
          c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, Math.PI * 2); c2.fill();
        });
        raf = requestAnimationFrame(tick);
      };
      ScrollTrigger.create({
        trigger: footer, start: 'top bottom', end: 'bottom top',
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
    <footer className="footer" ref={ref}>
      <canvas className="footer__steam" ref={steamRef} aria-hidden="true" />
      <div className="footer__pour"><canvas ref={pourRef} aria-hidden="true" /></div>
      <div className="footer__reveal">
        <h2 className="footer__big">
          <span className="fw"><span>See you at</span></span>
          <span className="fw fw--i"><span>the window</span></span>
        </h2>
        <div className="footer__cols">
          {COLS.map((c) => (
            <div className="footer__col" key={c.lab}>
              <span className="footer__lab">{c.lab}</span>
              {c.links.map((l) => (
                <a href={l.href} className="flink" key={l.t} data-cursor="link"
                  target="_blank" rel="noreferrer noopener">{l.t}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer__stores">
          <a className="storebtn" href={ORDER.ios} target="_blank" rel="noreferrer noopener" data-cursor="cta">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8s-1.6-.8-2.7-.7c-1.4 0-2.7.8-3.4 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6 1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 5.9c.6-.7 1-1.6.9-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.9 2.5.9.1 1.8-.4 2.4-1.2z" />
            </svg>
            <span><em>Download on the</em>App Store</span>
          </a>
          <a className="storebtn" href={ORDER.android} target="_blank" rel="noreferrer noopener" data-cursor="cta">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M3.6 2.2a1 1 0 0 0-.4.8v18a1 1 0 0 0 .4.8l10-9.8-10-9.8zm11.3 8.6 2.9-2.9-9.6-5.4 6.7 8.3zm0 2.4-6.7 8.3 9.6-5.4-2.9-2.9zm4.3-1.2-2.3-1.3-3 3 3 3 2.3-1.3c.8-.5.8-1.9 0-2.4z" />
            </svg>
            <span><em>Get it on</em>Google Play</span>
          </a>
        </div>
        <div className="footer__base">
          <span>© 2026 {SHOP.name} · {SHOP.nameAr} · Sharjah</span>
          <span>Mon–Fri 8am–11pm · Sat &amp; Sun 11am–11pm</span>
        </div>
      </div>
    </footer>
  );
}
