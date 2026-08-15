export type ProjectMetric = {
  label: string;
  value: string;
};

export type Project = {
  id: string;
  meta: string;
  title: string;
  description: string;
  metrics: ProjectMetric[];
  tech: string[];
  previewUrl?: string;
};

export const projects: Project[] = [
  {
    id: '01',
    meta: 'LEAD FRONTEND · 2022–NOW',
    title: 'Crew communication portal',
    description:
      'Lead frontend developer on a vessel crew portal at OneByOne Logistical. Real-time group chat on SignalR with optimistic rendering, live typing, edit, unread-count sync  sub-second, no polling. Spanning 350+ modules across 15 feature areas.',
    metrics: [
      { label: 'commits authored', value: '391 of 576' },
      { label: 'UI system', value: '48 components' },
    ],
    tech: ['React 19', 'TypeScript', 'SignalR', 'Redux Toolkit', 'Storybook'],
  },
  {
    id: '02',
    meta: 'SOLO BUILD',
    title: 'OptiRoute dispatcher dashboard',
    description:
      'A logistics platform I built end to end, modelling a four-stage pipeline: ingestion, AI route optimisation, fleet dispatch, live telemetry. Nearest-driver assignment by Haversine distance, off-route alerts on Mapbox GL, role-based access.',
    metrics: [
      { label: 'manifest grid', value: '10k rows, ~25 in DOM' },
      { label: 'filter + sort latency', value: 'under 200ms' },
    ],
    tech: ['Next.js 16', 'TypeScript', 'Mapbox GL', 'TanStack Virtual', 'Vitest'],
    previewUrl: 'https://opti-route-mauve.vercel.app/',
  },
  {
    id: '03',
    meta: 'FULL-STACK · IN PROGRESS',
    title: 'Ecommerce store  NestJS + Next.js',
    description:
      'A scalable backend API and storefront built the way production systems are: modular NestJS services, Prisma over PostgreSQL, JWT auth with role guards, containerised and shipped through CI/CD to AWS.',
    metrics: [
      { label: 'API surface', value: 'modular NestJS' },
      { label: 'deploy', value: 'Docker → CI/CD → AWS' },
    ],
    tech: ['NestJS', 'Prisma', 'PostgreSQL', 'JWT', 'Docker', 'AWS', 'Sass'],
  },
];
