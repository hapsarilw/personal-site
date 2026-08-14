export type ExperienceEntry = {
  period: string;
  industry: string;
  role: string;
  company: string;
  summary: string;
};

export const experience: ExperienceEntry[] = [
  {
    period: 'MAY 2022  NOW',
    industry: 'Logistics',
    role: 'Front End Developer',
    company: 'OneByOne Logistical',
    summary:
      'Two products, one team. Led the frontend of the crew communication portal, and built out the warehouse management portal before it. Along the way: a 48-component library with 40 Storybook stories, multi-environment CI/CD on Azure Pipelines and Vercel, i18next localisation, and type-safe forms with React Hook Form + Zod.',
  },
];

export const totalYearsLabel = '4+ YRS';
