/**
 * Central manifest for every photograph used on the public landing page.
 *
 * All images are served from Unsplash's CDN with sizing/quality params baked in,
 * so there are no binary assets in the repo. To swap in Empire Global's own
 * photography later, drop the files into `public/images/` and replace the URL
 * here — nothing else in the app needs to change.
 */

const unsplash = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

/* Hero rotator — the four frames behind the headline */
export const HERO_SLIDES = [
  {
    url: unsplash('1633158829585-23ba8f7c8caf', 1400),
    label: 'Grow your savings',
    caption: 'Flexible and fixed plans built around your goals',
  },
  {
    url: unsplash('1579621970563-ebec7560ff3e', 1400),
    label: 'Invest with confidence',
    caption: 'Stable returns, tracked in real time',
  },
  {
    url: unsplash('1556742049-0cfed4f6a45d', 1400),
    label: 'Own more, pay gradually',
    caption: 'Hire purchase with a transparent schedule',
  },
  {
    url: unsplash('1579532537598-459ecdaf39cc', 1400),
    label: 'Financial freedom, planned',
    caption: 'Every transaction verified before it lands',
  },
]

/* One editorial photo per product category */
export const PRODUCT_IMAGES = {
  savings: unsplash('1579621970795-87facc2f976d', 800),
  investment: unsplash('1590283603385-17ffb3a7f29f', 800),
  thrift: unsplash('1591696205602-2f950c417cb9', 800),
  loan: unsplash('1450101499163-c8848c66ca85', 800),
  'hire-purchase': unsplash('1441986300917-64674bd600d8', 800),
}

/* Supporting imagery for the narrative sections */
export const SECTION_IMAGES = {
  aboutPrimary: unsplash('1573497019940-1c28c88b4f3e', 900),
  aboutSecondary: unsplash('1600880292203-757bb62b4baf', 700),
  aboutTertiary: unsplash('1554224155-6726b3ff858f', 600),
  security: unsplash('1563986768609-322da13575f3', 1000),
  cta: unsplash('1521737711867-e3b97375f902', 1200),
}

/* Testimonial portraits */
export const AVATARS = {
  ngozi: unsplash('1573496359142-b8d87734a5a2', 200),
  emeka: unsplash('1507003211169-0a1dd7228f2d', 200),
  aisha: unsplash('1580489944761-15a19d654956', 200),
}
