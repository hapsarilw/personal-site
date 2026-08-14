export type StackGroup = {
  title: string;
  items: string[];
};

export const stackGroups: StackGroup[] = [
  {
    title: 'LANGUAGES',
    items: ['TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3 & Sass'],
  },
  {
    title: 'FRONTEND',
    items: ['React 19', 'Next.js 16'],
  },
  {
    title: 'BACKEND',
    items: ['NestJS', 'Express', 'Node.js', 'REST API design'],
  },
  {
    title: 'DATABASE & ORM',
    items: ['PostgreSQL', 'Prisma', 'SQL', 'Schema migrations'],
  },
  {
    title: 'AUTH & ACCESS',
    items: ['JWT authentication', 'Role-based access', 'Guards & interceptors'],
  },
  {
    title: 'STATE & DATA',
    items: ['Redux Toolkit', 'Zustand', 'TanStack Query', 'TanStack Table & Virtual'],
  },
  {
    title: 'FORMS & VALIDATION',
    items: ['React Hook Form', 'Zod', 'Formik', 'Yup'],
  },
  {
    title: 'UI & DESIGN SYSTEMS',
    items: ['Tailwind CSS', 'Radix UI', 'Storybook', 'Component architecture'],
  },
  {
    title: 'REAL-TIME & MAPS',
    items: ['SignalR', 'Mapbox GL'],
  },
  {
    title: 'TOOLING & TESTING',
    items: ['Git & GitHub', 'Vitest & RTL', 'MSW', 'SonarQube'],
  },
  {
    title: 'DEVOPS & CLOUD',
    items: ['Docker', 'AWS', 'CI/CD pipelines', 'Azure Pipelines & Vercel'],
  },
];
