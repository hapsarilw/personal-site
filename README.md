# personal-site

Personal site and technical blog for Hapsari Laksmi Wijayanti — junior software engineer.

Next.js App Router, statically generated. Posts are markdown files in this repo, so publishing
is a commit.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, TypeScript strict) |
| Styling | CSS Modules + design tokens in `src/app/globals.css` |
| 3D | three.js — ambient particle field and wireframe solids |
| Motion | GSAP + ScrollTrigger via `@gsap/react` |
| Content | Markdown + frontmatter, parsed at build time with `gray-matter` |
| Fonts | `next/font` — Archivo and JetBrains Mono, self-hosted |

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm start        # serve the build
npm run lint     # eslint
npm run typecheck
```

## Project layout

```
src/
├── app/                    routes, global CSS, metadata, manifest, sitemap
│   ├── page.tsx            the one-page site
│   ├── writing/            post index (/writing) and post pages (/writing/[slug])
│   ├── globals.css         design tokens — both themes live here
│   └── prose.css           styling for rendered markdown
├── components/
│   ├── background/         three.js field + comet trail (React lifecycle only)
│   ├── layout/             header, mobile menu, footer, section shell
│   ├── motion/             GSAP registration, Reveal, RevealGroup
│   ├── sections/           one component per page section
│   ├── theme/              theme provider
│   ├── ui/                 Button, Card, Tag, SectionHeading
│   └── writing/            post list, filterable browser
├── content/                all copy and post content
│   └── posts/              one markdown file per post
├── hooks/                  media query, install prompt, clipboard
└── lib/
    ├── markdown/           parse → AST → HTML renderer (server only)
    ├── three/              scene + palette, framework-free
    ├── canvas/             comet trail
    └── posts.ts            reads and validates the post files
```

## Writing a post

Add a markdown file to `src/content/posts/`. The filename becomes the URL slug —
`reconnect-is-the-design.md` is served at `/writing/reconnect-is-the-design`.

```markdown
---
title: 'Reconnect is the design, not the edge case'
excerpt: 'One line shown in the index and in search results.'
tags: ['system-design', 'real-time']
status: published        # or `draft` — drafts never reach the site
publishedAt: '2026-05-28'
updatedAt: '2026-05-28'
---

Body starts here.
```

Frontmatter is validated at build time: a missing `title`, a bad date, or an unknown `status`
fails the build rather than shipping a broken post.

Markdown supports headings, lists, quotes, fenced code (` ```ts `, ` ```py `, ` ```sql `),
bold, italic, inline code and links, plus two extras:

```markdown
![caption text](/assets/diagram.png)      → figure with caption, click to open full size
https://www.youtube.com/watch?v=VIDEOID   → on its own line, becomes a video preview card
```

Fenced blocks with no language are left unhighlighted, which is what you want for ASCII
diagrams. Images go in `public/assets/` and are referenced from the site root.

## Customising

| What | Where |
| --- | --- |
| Name, email, links, hero and about copy | `src/content/site.ts` |
| Projects, experience, stack, "looking for" | the matching file in `src/content/` |
| Accent colour, surfaces, text, borders | `:root` in `src/app/globals.css` |
| Light theme | `[data-theme='light']` in the same file |
| Particle count | `density` prop on `<ParticleField />` in `src/app/layout.tsx` |

The accent is defined once as `--accent`; three.js reads it from the stylesheet at runtime, so
changing that one value re-colours the page and the 3D field together.

Theme follows the system preference until the visitor picks one, then persists under
`hlw_theme_v1`. Reduced-motion preferences switch off the comet trail and every GSAP reveal.

## Deploy

**Vercel** — import the repo. Framework preset *Next.js*, no configuration needed.

For a purely static host (GitHub Pages, S3), add `output: 'export'` to `next.config.ts` and
serve the generated `out/` directory.

## Notes

- `public/hapsari-laksmi-resume.pdf` is a **placeholder**. Replace it with the real résumé;
  the path is set once in `site.resumeFile`.
- The About section has a portrait placeholder waiting for a 4:5 image.
- `dist/` holds the previous no-build version of the site and can be deleted once you are
  happy with this one.
