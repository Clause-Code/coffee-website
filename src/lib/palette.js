import gsap from 'gsap';

/* GSAP will not interpolate a CSS custom property as a colour, so we parse to
   RGB, tween plain numbers, and write the variables on update. That is what
   makes a flavour change a ~0.75s wash instead of an instant snap. */

function hexToRgb(h) {
  h = h.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function parseRgb(s) {
  const m = s.match(/(\d+(?:\.\d+)?)/g);
  return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 0, g: 0, b: 0 };
}
const rgbStr = (c) =>
  `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

let active = null;

export function tweenPalette(to, duration = 0.75) {
  const body = document.body;
  const cs = getComputedStyle(body);
  const keys = Object.keys(to);
  const from = {};
  const target = {};
  keys.forEach((k) => {
    const cur = cs.getPropertyValue(k).trim();
    from[k] = cur.startsWith('#') ? hexToRgb(cur) : parseRgb(cur || 'rgb(0,0,0)');
    target[k] = hexToRgb(to[k]);
  });

  active?.kill();
  const proxy = { t: 0 };
  active = gsap.to(proxy, {
    t: 1,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      const t = proxy.t;
      keys.forEach((k) => {
        const a = from[k];
        const b = target[k];
        body.style.setProperty(k, rgbStr({
          r: a.r + (b.r - a.r) * t,
          g: a.g + (b.g - a.g) * t,
          b: a.b + (b.b - a.b) * t
        }));
      });
    }
  });
  return active;
}

export function setPaletteInstant(to) {
  Object.entries(to).forEach(([k, v]) => document.body.style.setProperty(k, v));
}
