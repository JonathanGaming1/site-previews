/*
  ============================================================
  BUSINESS INFO — THIS IS THE ONLY FILE YOU EDIT PER CLIENT.
  ============================================================

  Every string, price, label and link on the page comes from this file.
  To sell the site to a business, replace the values below with their info
  and the whole page follows. You never need to touch layout code.

  Checklist for a client swap:
    1. brand        — company name, tagline, logo wordmark
    2. hero         — headline, sub-headline, CTA buttons
    3. logos        — client / partner names in the trust bar
    4. features     — up to 4 selling points ("span: 2" = wide card)
    5. steps        — how it works, 3 steps
    6. showcase     — 3 tabs describing the offer
    7. metrics      — up to 4 impressive numbers (count up on scroll)
    8. testimonials — social proof, 6 quotes ("hue" = avatar colour)
    9. pricing      — up to 3 tiers, "popular: true" highlights one
   10. faq          — 6 questions
   11. cta          — final call to action + email capture copy
   12. footer       — blurb, link columns, legal line

  To build a *new* copy of this template for the next client, keep this file
  as the template skeleton and paste the client's values over it.
*/

export const brand = {
  name: 'Aether',
  tagline: 'The future, engineered for you',
}

export const nav = {
  links: [
    { label: 'Product', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Clients', href: '#customers' },
    { label: 'Pricing', href: '#pricing' },
  ],
  signIn: { label: 'Sign in', href: '#' },
  cta: { label: 'Book a demo', href: '#cta' },
}

export const hero = {
  badge: 'Introducing the next generation',
  title: ['A premium experience,', 'engineered beyond expectation'],
  highlight: 'beyond',
  description:
    'We design and deliver flagship-grade digital experiences: precision-built, effortless to use and impossible to ignore. Trusted by industry leaders who refuse to settle.',
  primary: { label: 'Book a demo', href: '#cta' },
  secondary: { label: 'See how it works', href: '#how' },
  footnote: 'Limited onboarding each quarter. No commitment required.',
}

export const logos = ['Vantage', 'Nocturne', 'Helios', 'Sapphire', 'Crest', 'Obelisk', 'Meridian', 'Étoile']

export const features = {
  eyebrow: 'Why Aether',
  title: 'Built to a standard others chase',
  description: 'Every detail is intentional. Together, they set the bar for your industry.',
  items: [
    {
      key: 'collab',
      title: 'Design that commands attention',
      description: 'A visual language inspired by the world’s most admired brands — refined, precise and unmistakably yours.',
      span: 2,
    },
    {
      key: 'automation',
      title: 'Obsessive performance',
      description: 'Sub-second loads everywhere, on every device. Speed is part of the luxury.',
      span: 1,
    },
    {
      key: 'analytics',
      title: 'Intelligence built in',
      description: 'Live dashboards surface what matters, the moment it matters.',
      span: 1,
    },
    {
      key: 'integrations',
      title: 'Fits your existing stack',
      description: 'Connects to the tools you already run — ready in a click, without disruption.',
      span: 2,
    },
  ],
}

export const steps = {
  eyebrow: 'How it works',
  title: 'From first call to flawless launch',
  items: [
    {
      title: 'Discover',
      description: 'We study your business, audience and ambitions. Nothing is designed before it is understood.',
    },
    {
      title: 'Craft',
      description: 'We design and build every surface to a single rising standard. You review; we refine.',
    },
    {
      title: 'Launch',
      description: 'Delivery, measurement and iteration. The product keeps improving after launch day.',
    },
  ],
}

export const showcase = {
  eyebrow: 'One platform, every perspective',
  title: 'Every view, engineered to feel effortless',
  tabs: [
    {
      key: 'overview',
      title: 'Command',
      description: 'A single, calm overview of everything that matters today — ordered by importance.',
    },
    {
      key: 'flows',
      title: 'Flows',
      description: 'Move work across stages with one gesture. Owners and limits stay visible.',
    },
    {
      key: 'insights',
      title: 'Insights',
      description: 'Trends, forecasts and health without building a spreadsheet.',
    },
  ],
}

export const metrics = [
  { value: 1200, suffix: '+', label: 'Companies onboarded' },
  { value: 4.9, decimals: 1, label: 'Average client rating' },
  { value: 87, suffix: '%', label: 'Faster time to market' },
  { value: 99.99, decimals: 2, suffix: '%', label: 'Uptime last 12 months' },
]

export const testimonials = {
  eyebrow: 'Clients',
  title: 'Clients who upgrade rarely look back',
  items: [
    {
      quote:
        'It feels like a flagship product in the way that matters: nothing is accidental. Two of our board members asked who built it.',
      name: 'Maya Chen',
      role: 'Chief Executive, Vantage',
      hue: 250,
    },
    {
      quote: 'We replaced four tools in a week. The surprising part was how quiet it felt afterwards. People simply know what to do.',
      name: 'Daniel Okafor',
      role: 'Operations Director, Nocturne',
      hue: 170,
    },
    {
      quote: 'Our customers notice the difference immediately. Conversion is up 40%, and support questions are down.',
      name: 'Sofia Marin',
      role: 'Head of Digital, Helios',
      hue: 20,
    },
    {
      quote: 'The technical standard is extraordinary. Fast everywhere, flawless on mobile, and it has never gone down.',
      name: 'Jonas Weber',
      role: 'CTO, Sapphire',
      hue: 300,
    },
    {
      quote: 'Onboarding new clients took two weeks of context. Now it takes two days. Everything they need is already there.',
      name: 'Priya Natarajan',
      role: 'VP Client Experience, Crest',
      hue: 120,
    },
    {
      quote: 'Fast, focused and thoughtfully designed. It gets out of the way, which is the highest compliment I can give software.',
      name: 'Lucas Ferreira',
      role: 'Founder, Obelisk',
      hue: 40,
    },
  ],
}

export const pricing = {
  eyebrow: 'Pricing',
  title: 'Three tiers. One standard.',
  description: 'Start with what fits today. Move up as the business grows.',
  yearlyNote: 'Two months free',
  tiers: [
    {
      name: 'Essential',
      monthly: 0,
      yearly: 0,
      description: 'For small businesses establishing a premium presence.',
      cta: 'Start free',
      features: ['Core experience', 'Up to 10 team members', 'Standard support', 'Launch-ready in days'],
    },
    {
      name: 'Signature',
      monthly: 79,
      yearly: 65,
      description: 'For growing businesses that need the full standard.',
      cta: 'Start 14-day trial',
      popular: true,
      features: [
        'Everything in Essential',
        'Full automation suite',
        'Live insights and reporting',
        'Client and guest access',
        'Priority support',
      ],
    },
    {
      name: 'Flagship',
      monthly: 199,
      yearly: 165,
      description: 'For organisations with advanced and security needs.',
      cta: 'Talk to us',
      features: ['Everything in Signature', 'Single sign-on', 'Audit log and data residency', 'Custom roles', 'Dedicated success manager'],
    },
  ],
}

export const faq = {
  title: 'Questions, answered',
  items: [
    {
      q: 'How long does implementation take?',
      a: 'Most clients launch within two weeks. We import everything from your existing setup, so the team starts working on day one.',
    },
    {
      q: 'Is there a free plan?',
      a: 'The Essential tier is free for up to 10 people, indefinitely. It is not a trial and it does not expire.',
    },
    {
      q: 'How does billing work for clients and guests?',
      a: 'Guests are free on Signature and Flagship tiers. You only pay for members of your own team.',
    },
    {
      q: 'Where is our data stored?',
      a: 'In the region you choose at signup, encrypted at rest and in transit. Flagship plans can pin data to the EU or the US.',
    },
    {
      q: 'Can we cancel at any time?',
      a: 'Yes. Downgrade or cancel from billing settings at any time, and your workspace stays readable forever.',
    },
    {
      q: 'Do you offer startup or nonprofit terms?',
      a: 'We do. Eligible startups get the Signature tier free for a year, and nonprofits receive 50% off every tier.',
    },
  ],
}

export const cta = {
  title: 'Give your business the standard it deserves',
  description: 'Book a demo and see the difference within a week.',
  placeholder: 'you@company.com',
  button: 'Book a demo',
  success: 'You are on the list. Watch your inbox.',
}

export const footer = {
  blurb: 'The future, engineered for you.',
  columns: [
    { title: 'Product', links: ['Features', 'Integrations', 'Changelog', 'Pricing', 'Security'] },
    { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press', 'Contact'] },
    { title: 'Resources', links: ['Docs', 'Guides', 'Case studies', 'Community', 'Status'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Licenses'] },
  ],
  legal: `© ${new Date().getFullYear()} Aether, Inc.`,
}
