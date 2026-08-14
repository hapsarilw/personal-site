/**
 * Single source of truth for identity, copy, and navigation.
 * Everything user-facing that is not a post lives here or in a sibling module,
 * so components stay presentational.
 */

export const site = {
  name: 'Hapsari Laksmi Wijayanti',
  shortName: 'H. Laksmi',
  role: 'Junior Software Engineer',
  email: 'hapsari.laksmiw@gmail.com',
  location: 'Bandung, Indonesia',
  timezone: 'GMT+7',
  url: 'https://hapsarilw.vercel.app',
  description:
    'Four years of production frontend for enterprise logistics, now shipping the API behind it. Selected work, engineering notes, and availability.',
  resumeFile: '/hapsari-laksmi-resume.pdf',
} as const;

export const socialLinks = [
  { label: 'GITHUB/HAPSARILW', href: 'https://github.com/hapsarilw' },
  { label: 'LINKEDIN/HAPSARILW', href: 'https://www.linkedin.com/in/hapsarilw' },
] as const;

export const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Stack', href: '/#stack' },
  { label: 'Writing', href: '/#writing' },
  { label: 'About', href: '/#about' },
] as const;

export const hero = {
  availability: 'OPEN TO JUNIOR SOFTWARE ENGINEER ROLES',
  eyebrow: 'HAPSARI LAKSMI WIJAYANTI  /  JUNIOR SOFTWARE ENGINEER',
  headline: 'Four years of production frontend. Now shipping the API behind it.',
  summary:
    'I write TypeScript for enterprise logistics, where a mis-rendered pallet ID sends someone to the wrong aisle. That taught me to be careful about state and unromantic about clever code. I am applying the same discipline to the other half of the stack — NestJS, Prisma, Postgres, containerised and deployed.',
  badges: [
    { label: '4 YRS PRODUCTION REACT', accent: true },
    { label: 'LED A FEATURE AREA END TO END', accent: false },
    { label: 'BUILDING FULL-STACK NOW', accent: false },
  ],
  facts: [
    { label: 'BASED', value: 'Bandung, Indonesia · GMT+7' },
    { label: 'FOCUS', value: 'Full-stack TypeScript — React front, NestJS back' },
    { label: 'OPEN TO', value: 'Junior software engineer — frontend or full-stack' },
  ],
} as const;

export const about = {
  paragraphs: [
    'I write frontend for enterprise logistics — software where a mis-rendered pallet ID sends someone to the wrong aisle. Four years of that has made me careful about state and unromantic about clever code.',
    'I am looking for a junior software engineer role where I can widen out: keep the React and TypeScript depth, and add the backend, testing, and systems work I currently only meet from the client side of the fetch.',
  ],
  facts: [
    { label: 'LEARNING', value: 'NestJS, Prisma and Postgres — the other side of the request' },
    { label: 'BUILDING', value: 'OptiRoute — a dispatcher dashboard I use as a proving ground' },
    { label: 'HABIT', value: 'Writing the reusable version the second time, not the fourth' },
  ],
} as const;

export const contact = {
  heading: 'WRITE TO ME',
  blurb: 'Send a role, a repo, or a problem you are stuck on. I answer everything within a day.',
  readerCta: 'Questions, or hiring for a junior role?',
} as const;
