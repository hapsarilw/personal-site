/**
 * Single source of truth for identity, copy, and navigation.
 * Everything user-facing that is not a post lives here or in a sibling module,
 * so components stay presentational.
 */

export const site = {
  name: 'Hapsari Laksmi Wijayanti',
  shortName: 'H. Laksmi',
  role: 'Software Engineer',
  email: 'hapsari.laksmiw@gmail.com',
  location: 'Bali, Indonesia',
  timezone: 'GMT+8',
  url: 'https://hapsarilw.vercel.app',
  description:
    'Lead frontend on a vessel crew portal. Four years of production TypeScript for enterprise logistics, now shipping the API behind it. Work, notes, availability.',
  resumeFile: '/resume.pdf',
  resumeDownloadName: 'Hapsari_Laksmi_W_Resume.pdf',
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
  availability: 'OPEN TO FRONTEND AND FULL-STACK ENGINEER ROLES',
  eyebrow: 'HAPSARI LAKSMI WIJAYANTI  /  SOFTWARE ENGINEER',
  headline: 'Four years of production frontend. Now shipping the API behind it.',
  summary:
    'I write typescript for enterprise logistics. One mis-rendered pallet id and someone walks to the wrong aisle, so i\'m careful about state and unimpressed by code that shows off. Currently pointing that same discipline at nestjs, prisma, postgres, containerised and shipped.',
  badges: [
    { label: '48-COMPONENT UI SYSTEM', accent: true },
    { label: 'LED A FEATURE AREA END TO END', accent: false },
    { label: 'BUILDING FULL-STACK NOW', accent: false },
  ],
  facts: [
    { label: 'BASED', value: 'Bali, Indonesia · GMT+8' },
    { label: 'FOCUS', value: 'Full-stack TypeScript  React front, NestJS back' },
    { label: 'OPEN TO', value: 'Software engineer  frontend or full-stack' },
  ],
} as const;

export const about = {
  paragraphs: [
    'I got into software through the part people actually touch. Frontend taught me that trust lives in small stuff, a loading state that doesn\'t lie, a form that fails without drama, a layout that survives bad wifi.',
    'Now i\'m going wide without losing the depth. Backend, testing, systems. I already own features end to end on the frontend, from the call where someone explains what they actually need through CI to release, and i want that same ownership over the query that makes it happen.',
  ],
  facts: [
    { label: 'BUILDING', value: 'NestJS, Prisma and Postgres  the other side of the request' },
    { label: 'SHIPPED', value: 'OptiRoute  a dispatcher dashboard I built end to end' },
    { label: 'HABIT', value: "I frame feedback as what it fixes, not what's wrong" },
  ],
} as const;

export const contact = {
  heading: 'WRITE TO ME',
  blurb: 'Send a role, a repo, or a problem you are stuck on. I answer everything within a day.',
  readerCta: 'Questions, or hiring?',
} as const;
