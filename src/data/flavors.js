/* ══════════════════════════════════════════════════════════════════════
   THE YARD — ذا يارد
   Sharjah Research, Technology & Innovation Park

   Everything in this file is real. The drinks, the photographs and the
   descriptions come from their own Drivu ordering page; the reviews are
   verbatim Google reviews; the address, phone and hours are their listing.
   Nothing is invented — where a number could not be verified (item prices
   are not published on their public menu) it is simply not shown.

   Photography: their Drivu menu photos, background-removed and normalised
   to 1000px tall RGBA WebP. Every cup is one of their real branded cups.
   `ar` is the photo's own width/height — the layout sizes cups by HEIGHT
   and derives the width from this, so each drink keeps its true shape.
   ══════════════════════════════════════════════════════════════════ */

const S = 'assets/stills/';

/* The Yard's brand colours, sampled from their logo and cups. The accent
   (their sage green) is deliberately CONSTANT across every flavour — only
   the wash and the display type shift as you scroll. */
export const BRAND = {
  green: '#6E8B4F',
  greenDeep: '#4A5C34',
  cream: '#F3ECDD',
  ink: '#24291C'
};

export const ORDER = {
  ios: 'https://apps.apple.com/ae/app/drivu-your-drive-thru-orders/id1207582756',
  android: 'https://play.google.com/store/apps/details?id=co.m4.drivu',
  instagram: 'https://www.instagram.com/the.yard.ae/'
};

/* every "get the app" button points straight at a store listing — Android
   phones go to Google Play, everything else to the App Store. The whole
   menu now lives on this site, so nothing links out to the web menu. */
export const storeLink = () =>
  typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
    ? ORDER.android
    : ORDER.ios;

export const SHOP = {
  name: 'The Yard',
  nameAr: 'ذا يارد',
  area: 'Sharjah Research, Technology & Innovation Park',
  address: 'Near Innovation Street, University City\nSharjah, United Arab Emirates',
  phone: '+971 58 678 8470',
  phoneHref: 'tel:+971586788470',
  hours: 'Mon–Fri 8am–11pm\nSat & Sun 11am–11pm',
  rating: '4.7',
  reviewCount: '145',
  maps: 'https://www.google.com/maps/search/?api=1&query=The+Yard+%D8%B0%D8%A7+%D9%8A%D8%A7%D8%B1%D8%AF&query_place_id=ChIJkeiZN_5fXz4RZAHDKfltov8'
};

/* ── the three the section-2 story runs through ── */
export const FLAVORS = {
  flatwhite: {
    id: 'flatwhite', index: '01', name: 'Flat White',
    tagline: 'Double ristretto under steamed milk. Nothing hiding.',
    still: S + 'y-flatwhite.webp', ar: 0.73,
    swatch: '#B98A56',
    palette: {
      '--bg': '#F3ECDD', '--bg-deep': '#31240F', '--ink': '#24291C',
      '--accent': '#6E8B4F', '--glow': '#C9A87C', '--dim': '#877A64',
      '--display': '#B08B5F'
    },
    callouts: [
      { n: '01', h: 'In their top three', p: 'The Yard\u2019s own ordering page lists it under \u201Cpeople mostly buy\u201D.' },
      { n: '02', h: 'Double ristretto', p: 'Two short shots under steamed milk. No syrup, no foam to hide behind.' },
      { n: '03', h: 'One of nine hot coffees', p: 'Spanish latte, cortado, piccolo, cappuccino and the rest sit beside it.' }
    ]
  },
  strawmatcha: {
    id: 'strawmatcha', index: '02', name: 'Strawberry Matcha',
    tagline: 'Ceremonial grade matcha under strawberry.',
    still: S + 'y-strawmatcha.webp', ar: 0.78,
    swatch: '#8FA65C',
    palette: {
      '--bg': '#F2F0E1', '--bg-deep': '#28331B', '--ink': '#222A18',
      '--accent': '#6E8B4F', '--glow': '#D6A2B4', '--dim': '#7C8168',
      '--display': '#9DB070'
    },
    callouts: [
      { n: '01', h: 'Ceremonial grade', p: 'Whisked to order, never poured from a premix.' },
      { n: '02', h: 'Milk of your choice', p: 'Full fat, oat, almond or coconut — the coconut one is its own menu item.' },
      { n: '03', h: 'One of seven matchas', p: 'Coconut, mango, salted vanilla foam, cheesecake, hot and plain iced.' }
    ]
  },
  acai: {
    id: 'acai', index: '03', name: 'Acai Smoothie',
    tagline: 'No coffee in it at all. Thick enough for a spoon.',
    still: S + 'y-acai.webp', ar: 0.8,
    swatch: '#8A6B84',
    palette: {
      '--bg': '#F1ECE6', '--bg-deep': '#2C1F2C', '--ink': '#251E26',
      '--accent': '#6E8B4F', '--glow': '#B294A6', '--dim': '#7F7280',
      '--display': '#977B90'
    },
    callouts: [
      { n: '01', h: 'Not coffee at all', p: 'Blended acai, thick and cold. The one people order when they have had enough espresso.' },
      { n: '02', h: 'First on their own list', p: 'The Yard\u2019s ordering page puts it at the top of \u201Cpeople mostly buy\u201D.' },
      { n: '03', h: 'Sits with the cold drinks', p: 'Next to the taro shake, cascara, hibiscus and purple fizz.' }
    ]
  }
};

/* Hero-only drinks: a real cup in the row, no story segment of its own. */
export const HERO_EXTRAS = {
  cascarapeach: {
    id: 'cascarapeach', index: '04', name: 'Cascara Peach',
    tagline: 'Coffee cherry tea over peach. Bright and not sweet.',
    still: S + 'y-cascarapeach.webp', ar: 0.769,
    swatch: '#D98A45',
    heroOnly: true,
    palette: {
      '--bg': '#F5EBDA', '--bg-deep': '#40230C', '--ink': '#2A2318',
      '--accent': '#6E8B4F', '--glow': '#E0A46A', '--dim': '#8A7860',
      '--display': '#C4894E'
    }
  }
};

export const ALL_DRINKS = { ...FLAVORS, ...HERO_EXTRAS };

export const STORY_ORDER = ['flatwhite', 'strawmatcha', 'acai'];

/* The hero row, left to right. Slot 2 is the LEAD — the cup that travels
   into the second half of the section. */
export const HERO_ROW = [
  { slot: 'p1', row: 'up',  drink: 'strawmatcha' },
  { slot: 'p2', row: 'up',  drink: 'flatwhite', lead: true },
  { slot: 'p3', row: 'low', drink: 'cascarapeach' },
  { slot: 'p4', row: 'low', drink: 'acai' }
];

export const STATS = [
  { b: SHOP.rating, s: 'Google rating' },
  { b: SHOP.reviewCount, s: 'Reviews' },
  { b: '70+', s: 'On the menu' }
];

/* The board itself lives in data/menu.js — the complete Drivu menu,
   9 categories and 73 items. Section 3 renders all of it. */

/* ── real Google reviews (google.com/maps · The Yard ذا يارد) ── */
export const QUOTES = [
  { q: 'I get my coffee from this place every day — it’s my go-to spot in the building! The vibes are always positive, and every single staff member is genuinely friendly and smiling.',
    a: 'Shamsa A', m: 'Google · 5 stars' },
  { q: 'My favourite way to start the day. Their coffee is always top notch, rich and smooth just the way I like it, even the Matcha.',
    a: 'Hawra A', m: 'Google · 5 stars' },
  { q: 'Great service, great coffee and dessert. The chocolate fondant was so delicious. The place is so quiet and relaxing.',
    a: 'Zero', m: 'Google · 5 stars' },
  { q: 'Went with a cortado made with Brazilian beans. Smooth, well-balanced, and just the right strength. The coffee definitely speaks for itself.',
    a: 'Noura', m: 'Google · 5 stars' },
  { q: 'Amazing coffee, friendly and chill staff, and reasonable prices. Their sweets are delicious, and service is always quick.',
    a: 'Meshal A', m: 'Google · 5 stars' },
  { q: 'I had such a great experience. Glyce and Mathilda were so kind and friendly, and made everything smooth and enjoyable.',
    a: 'Abrar A', m: 'Google · 5 stars' },
  { q: 'Nice experience in a quiet place and delicious sweets. Thanks a lot to Zen for his service.',
    a: 'Osama S', m: 'Google · 5 stars' },
  { q: 'I’m also obsessed with their Aseeda and cinnamon roll — both are packed with flavour and feel like a warm hug in food form.',
    a: 'Hawra A', m: 'Google · 5 stars' }
];
