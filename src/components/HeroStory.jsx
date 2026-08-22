import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { FLAVORS, HERO_ROW, STORY_ORDER, ALL_DRINKS, STATS, storeLink } from '../data/flavors';
import { openStoreSheet } from './StoreModal';
import { assetV } from '../lib/frames';
import { useFlavor } from '../hooks/useFlavor';

/* ══════════════════════════════════════════════════════════════════════
   HeroStory — the hero and the old "Section 2" are ONE pinned section.

     HALF 1  the cup row, headline, stats
     TRAVEL  the lead (brown) cup descends into the centre of half 2
     HALF 2  the flavour story: cups hand off left-to-right, callouts wipe

   THE CUPS ARE STILL IMAGES. There is no frame scrub in half 2 any more —
   the liquid does not move (explicit request). Everything the cups do is a
   transform, which means the whole section reverses exactly: scrubbed
   tweens play backwards frame-for-frame, and the two pieces of state that
   are NOT tweens (the palette and the 01/02/03 counter) are recomputed
   from the timeline playhead on every update instead of being fired by
   one-shot callbacks. One-shot callbacks are what used to leave the wrong
   colour behind when you scrolled back up.
   ══════════════════════════════════════════════════════════════════ */

export default function HeroStory() {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const leadRef = useRef(null);      // .hcup__inner of the lead cup — travels
  const leadBoxRef = useRef(null);   // .hcup--lead — exits left at the hand-off
  const leadImgRef = useRef(null);
  const slotRef = useRef(null);      // invisible marker: a cup's box in half 2
  const queueRefs = [useRef(null), useRef(null)];   // matcha, rose
  const heroLayer = useRef(null);
  const storyLayer = useRef(null);
  const idxRef = useRef(null);
  const { setFlavor, activeRef } = useFlavor();

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    const cup = leadRef.current;
    if (!root || !pin || !cup) return;

    const touch = window.matchMedia('(hover: none)').matches;
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const upper = gsap.utils.toArray('.hcup--up');
      const lower = gsap.utils.toArray('.hcup--low');
      const sideCups = gsap.utils.toArray('.hcup--side');
      const words = gsap.utils.toArray('.hero__h1 .w');
      const bigLines = gsap.utils.toArray('.story__big .sl > span');
      const panels = gsap.utils.toArray('.story__panel');

      /* ── entrance state ── */
      gsap.set(words, { yPercent: 115 });
      gsap.set(lower, { opacity: 0, yPercent: 92, scale: 0.9, rotation: -8 });
      gsap.set(upper, { opacity: 0, yPercent: 26, scale: 0.9, rotation: -14 });
      gsap.set('.hcopy .hseal, .hcopy .btn-orange, .hstats', { opacity: 0 });
      gsap.set(bigLines, { yPercent: 112 });
      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(storyLayer.current, { opacity: 0 });

      /* ── hero entrance, fired once the loader hands over ── */
      const intro = () => {
        const tl = gsap.timeline();
        tl.to(upper, {
          opacity: 1, yPercent: 0, scale: 1, rotation: 0,
          duration: 1.05, ease: 'back.out(1.3)', stagger: 0.1
        });
        tl.to(lower, {
          opacity: 1, yPercent: 0, scale: 1, rotation: 0,
          duration: 1.25, ease: 'back.out(1.15)', stagger: 0.12
        }, '<0.28');
        tl.to(words, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.1 }, '<0.1');
        tl.to('.hcopy .hseal, .hcopy .btn-orange',
          { opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '<0.35');
        tl.to('.hstats', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<0.1');
        return tl;
      };
      window.__heroIntro = intro;
      if (reduced) {
        gsap.set([...upper, ...lower], { opacity: 1, yPercent: 0, scale: 1, rotation: 0 });
        gsap.set(words, { yPercent: 0 });
        gsap.set('.hcopy .hseal, .hcopy .btn-orange, .hstats', { opacity: 1 });
      }

      /* ── measure where the lead cup must land in half 2 ──
         Measured from OFFSETS, never getBoundingClientRect(): the rect
         includes every transform above the element, and at refresh time the
         cup still carries its entrance transform. Offsets cannot drift. */
      const target = { x: 0, y: 0, scale: 1 };
      const preview = { x: 0, y: 0, scale: 0.3 };

      const offsetIn = (el, stop) => {
        let ox = 0, oy = 0, n = el;
        while (n && n !== stop && n.offsetParent) {
          ox += n.offsetLeft; oy += n.offsetTop; n = n.offsetParent;
        }
        return { x: ox, y: oy };
      };

      const measure = () => {
        const slotEl = slotRef.current;
        if (!slotEl) return;
        const cupW = cup.offsetWidth, cupH = cup.offsetHeight;
        const slotW = slotEl.offsetWidth, slotH = slotEl.offsetHeight;
        if (!cupH || !slotH) return;

        const c = offsetIn(cup, pin);
        const sPos = offsetIn(slotEl, pin);

        target.x = (sPos.x + slotW / 2) - (c.x + cupW / 2);
        target.y = (sPos.y + slotH / 2) - (c.y + cupH / 2);
        target.scale = slotH / cupH;

        /* The waiting cup used to park level with the centre cup, which put
           it right beside the callout column. It now sits HIGHER and SMALLER
           so it reads as “next up” without crowding the text. */
        preview.x = pin.offsetWidth * (narrow ? 0.34 : 0.37);
        preview.y = -pin.offsetHeight * (narrow ? 0.16 : 0.22);
        preview.scale = narrow ? 0.17 : 0.19;
      };
      measure();

      /* ── the master scrub ── */
      const SEG = 4.2;          // scroll units per flavour segment
      const TRAVEL = 2.2;       // hero -> story handoff
      const HOLD = 1.0;         // hero holds before anything moves
      const n = STORY_ORDER.length;
      const per = touch ? 1.15 : 1.75;
      const total = window.innerHeight * per * (n + 1.2);
      const base = HOLD + TRAVEL;
      const handoffAt = (i) => base + i * SEG + SEG * 0.70;

      /* Deterministic state: which flavour / which counter number belongs to
         a given playhead time. Called from the timeline's own onUpdate, so
         it is identical scrolling down and scrolling up. */
      /* flip the counter and the palette in the MIDDLE of the hand-off, not
         at its first frame — otherwise the new number appears while the old
         panel is still fading out and the two disagree for a beat. */
      const segAt = (t) => {
        let idx = 0;
        for (let i = 0; i + 1 < n; i++) if (t >= handoffAt(i) + SEG * 0.16) idx = i + 1;
        return idx;
      };
      const syncState = () => {
        const t = tl.time();
        const id = STORY_ORDER[segAt(t)];
        if (activeRef.current !== id) setFlavor(id, { duration: 0.9 });
        const el = idxRef.current;
        if (el) {
          const txt = FLAVORS[id].index;
          if (el.textContent !== txt) el.textContent = txt;
        }
      };

      const tl = gsap.timeline({
        onUpdate: syncState,
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=' + total,
          pin: pin,
          pinSpacing: true,
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: (self) => {
            const p = document.getElementById('storyProg');
            if (p) p.style.transform = `scaleX(${self.progress})`;
          }
        }
      });

      /* HALF 1 holds, then exits */
      tl.to({}, { duration: HOLD });
      tl.to(sideCups, {
        opacity: 0, yPercent: 40, scale: 0.86,
        duration: TRAVEL * 0.55, ease: 'power2.in', stagger: 0.05
      }, HOLD);
      tl.to('.hcopy, .hstats', {
        opacity: 0, y: -30, duration: TRAVEL * 0.5, ease: 'power2.in'
      }, HOLD);

      /* THE TRAVEL — the same cup descends into the centre of half 2 */
      tl.to(cup, {
        x: () => target.x,
        y: () => target.y,
        scale: () => target.scale,
        rotation: 0,
        duration: TRAVEL,
        ease: 'power1.inOut'
      }, HOLD);

      /* half 2 fades up behind it */
      tl.to(storyLayer.current, { opacity: 1, duration: TRAVEL * 0.6 }, HOLD + TRAVEL * 0.35);
      tl.to(bigLines, {
        yPercent: 0, duration: TRAVEL * 0.7, ease: 'expo.out', stagger: 0.09
      }, HOLD + TRAVEL * 0.4);

      /* HALF 2 — flavour segments. The cups do not rotate and the liquid
         does not move; the only motion is the straight horizontal hand-off
         and the callouts wiping in. */
      const cupEls = [cup, queueRefs[0].current, queueRefs[1].current];
      const boxEls = [leadBoxRef.current, queueRefs[0].current, queueRefs[1].current];

      // cups 1 and 2 wait small at mid-right, invisible until cued
      [1, 2].forEach((i) => {
        gsap.set(cupEls[i], {
          x: () => preview.x, y: () => preview.y,
          scale: () => preview.scale, opacity: 0
        });
      });

      /* the nav's "Most Loved" link needs the scroll position where half 2
         starts, not the top of the section — expose it */
      window.__mostLovedY = () => {
        const st = tl.scrollTrigger;
        if (!st) return 0;
        const frac = (HOLD + TRAVEL * 0.92) / tl.duration();
        return st.start + (st.end - st.start) * frac;
      };

      STORY_ORDER.forEach((id, i) => {
        const panel = panels[i];
        const at = base + i * SEG;

        /* panel in / panel out — real tweens, so they undo cleanly */
        tl.set(panel, { autoAlpha: 1 }, at + 0.01);

        const callouts = panel ? panel.querySelectorAll('.callout') : [];
        callouts.forEach((c, k) => {
          tl.fromTo(c,
            { opacity: 0, x: 44, clipPath: 'inset(0 100% 0 0)' },
            { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: SEG * 0.20, ease: 'power2.out' },
            at + SEG * 0.05 + k * (SEG * 0.19));
        });

        /* reveal the NEXT cup, small at mid-right, while this one holds */
        if (i + 1 < n) {
          tl.to(cupEls[i + 1], { opacity: 1, duration: SEG * 0.3, ease: 'power1.out' },
            at + SEG * 0.14);
        }

        /* ── the hand-off ── */
        if (i + 1 < n) {
          const hAt = handoffAt(i);

          // outgoing cup leaves straight out of the left edge
          tl.to(boxEls[i], {
            xPercent: -190, opacity: 0, duration: SEG * 0.30, ease: 'power1.inOut'
          }, hAt);

          // incoming cup drops from its perch onto the slot and matches size
          tl.to(cupEls[i + 1], {
            x: 0, y: 0, scale: 1, duration: SEG * 0.30, ease: 'power1.inOut'
          }, hAt);

          tl.to(panel, { autoAlpha: 0, duration: SEG * 0.16 }, hAt);
        }
      });

      /* the last cup is the one the board section picks up — publish the
         exact screen box it occupies at the end of the pin so the flight
         never has to guess (see Menu.jsx) */
      window.__storyCupRect = () => {
        /* the LAST story cup, not the generic slot marker: every drink is
           photographed at its own aspect ratio now, so the cup that flies
           into the board is not the same width as the marker. */
        const slotEl = cupEls[cupEls.length - 1] || slotRef.current;
        if (!slotEl || !pin) return null;
        const w = slotEl.offsetWidth, h = slotEl.offsetHeight;
        if (!w || !h) return null;
        /* At the end of the pin the stage is flush with the top-left of the
           viewport, so the slot's OFFSET inside the stage is its screen box.
           (Do not assume the slot is dead-centre — on phones it is nudged up
           to leave room for the callouts.) */
        const o = offsetIn(slotEl, pin);
        return { left: o.x, top: o.y, width: w, height: h };
      };

      let rt;
      const onResize = () => {
        clearTimeout(rt);
        rt = setTimeout(measure, 180);
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        window.__storyCupRect = null;
      };
    }, rootRef);

    return () => ctx.revert();
  }, [setFlavor]);

  /* A hero-only drink picked from the flavour menu simply swaps the lead
     cup's photo. (It used to repaint a canvas.) */
  useEffect(() => {
    const img = leadImgRef.current;
    if (!img) return;
    const d = ALL_DRINKS[activeRef.current];
    if (!d?.still) return;
    const next = import.meta.env.BASE_URL + d.still + assetV();
    if (img.getAttribute('src') !== next) img.setAttribute('src', next);
  });

  const lead = HERO_ROW.find((c) => c.lead);

  return (
    <section className="herostory" id="hero" ref={rootRef}>
      <div className="herostory__pin" ref={pinRef}>

        {/* ── HALF 1 ── */}
        <div className="half half--hero" ref={heroLayer}>
          <div className="hstats">
            {STATS.map((st) => (
              <div key={st.s}><b>{st.b}</b><span>{st.s}</span></div>
            ))}
          </div>

          <div className="hcopy">
            <span className="hseal" aria-hidden="true">
              <svg viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="30" cy="30" r="21" stroke="currentColor" strokeWidth="1" opacity=".5" />
                <path d="M22 34c0-5 3.6-8 8-8s8 3 8 8-3.6 7-8 7-8-2-8-7Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M26 22c-1.6-1.6 1.6-2.6 0-4.2M30 21c-1.6-2 1.6-3.3 0-5.4M34 22c-1.6-1.6 1.6-2.6 0-4.2"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <h1 className="hero__h1">
              <span className="hl"><span className="w">Pull up to</span></span>
              <span className="hl"><span className="w">The Yard</span></span>
            </h1>
            <a className="btn-orange" href={storeLink()} id="heroCta" data-cursor="cta"
               onClick={(e) => { e.preventDefault(); openStoreSheet(); }}
               target="_blank" rel="noreferrer noopener"><span>Order on the app</span></a>
          </div>

        </div>

        {/* ── HALF 2 ── same background, revealed by scroll ── */}
        <div className="half half--story" ref={storyLayer}>
          <div className="story__head">
            <span className="story__counter"><i ref={idxRef}>01</i><em>/ 03</em></span>
          </div>

          <h2 className="story__big" aria-hidden="true">
            <span className="sl"><span>THE THREE</span></span>
            <span className="sl"><span>EVERYONE ORDERS</span></span>
            <span className="sl"><span>ON REPEAT</span></span>
          </h2>

          <div className="caps" aria-hidden="true">
            <span className="cap cap--l"><img src={`${import.meta.env.BASE_URL}assets/stills/bean.webp${assetV()}`} alt="" /></span>
            <span className="cap cap--r"><img src={`${import.meta.env.BASE_URL}assets/stills/bean.webp${assetV()}`} alt="" /></span>
          </div>

          {STORY_ORDER.map((id) => (
            <div className="story__panel" key={id} data-flavor={id}>
              <div className="callouts">
                {FLAVORS[id].callouts.map((c) => (
                  <div className="callout" key={c.n}>
                    <span className="callout__n">{c.n}</span>
                    <h4>{c.h}</h4>
                    <p>{c.p}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="story__progress" aria-hidden="true"><span id="storyProg" /></div>
        </div>

        {/* invisible marker: the exact box a cup occupies in half 2 */}
        <div className="cupslot" ref={slotRef} aria-hidden="true" />

        {/* cups 2 and 3 wait here, small at mid-right, then match-and-move
            onto the slot as the previous cup exits left */}
        {STORY_ORDER.slice(1).map((id, i) => (
          <div className="scup" key={id} ref={queueRefs[i]} aria-hidden="true"
            style={{ '--ar': FLAVORS[id].ar }}>
            <img src={`${import.meta.env.BASE_URL}${FLAVORS[id].still}${assetV()}`} alt="" />
          </div>
        ))}

        {/* ── the cup row. The LEAD cup is the single element that travels
              from half 1 into half 2. ── */}
        <div className="hrow">
          {HERO_ROW.map((c) =>
            c.lead ? (
              <div className={`hcup hcup--${c.slot} hcup--${c.row} hcup--lead`} key={c.slot} ref={leadBoxRef}
                style={{ '--ar': ALL_DRINKS[c.drink].ar }}>
                <div className="hcup__inner" ref={leadRef}>
                  <img ref={leadImgRef}
                    src={`${import.meta.env.BASE_URL}${ALL_DRINKS[c.drink].still}${assetV()}`}
                    alt="The Yard iced coffee" />
                </div>
              </div>
            ) : (
              <div className={`hcup hcup--${c.slot} hcup--${c.row} hcup--side`} key={c.slot}
                style={{ '--ar': ALL_DRINKS[c.drink].ar }}>
                <img src={`${import.meta.env.BASE_URL}${ALL_DRINKS[c.drink].still}${assetV()}`}
                  alt={ALL_DRINKS[c.drink].name} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
