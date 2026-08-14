export type LookingForCard = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

export const lookingForCards: LookingForCard[] = [
  {
    eyebrow: 'THE ROLE',
    title: 'Junior software engineer',
    description:
      'Frontend-leaning or full-stack. Four years of production React means I arrive useful on day one — and I am already writing the NestJS half in my own time.',
    points: ['React + TypeScript foundation', 'Open to backend and platform'],
  },
  {
    eyebrow: 'THE TEAM',
    title: 'Somewhere with real users',
    description:
      'Operations tooling, logistics, anything with a domain. I do my best work where correctness matters more than novelty.',
    points: ['Code review and pairing', 'Remote or Bandung / Jakarta'],
  },
  {
    eyebrow: 'DAY ONE',
    title: 'What I bring with me',
    description:
      'A design-system habit, comfort owning a feature area from Figma through CI to release, and a backend I built rather than read about.',
    points: ['TypeScript-first, front and back', 'Storybook, Vitest, Docker, CI/CD'],
  },
];
