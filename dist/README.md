# personal-site

Personal site and technical blog for Hapsari Laksmi Wijayanti — junior software engineer.

Static, no build step, installable as a PWA. Open `index.html` in a browser or serve the
folder with any static host.

## Stack

- Plain HTML + React (loaded at runtime, no bundler)
- three.js — ambient particle field and wireframe solids behind the page
- GSAP + ScrollTrigger — scroll reveals, section wipes, reading progress, nav retract
- Service worker + web manifest — offline shell, installable on mobile and desktop
- Posts persist in `localStorage` (see *Writing is client-side* below)

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The entire site — markup, styles, and logic |
| `support.js` | Runtime that mounts the component in `index.html` |
| `manifest.webmanifest` | PWA metadata: name, icons, theme colour, standalone display |
| `sw.js` | Service worker — cache-first shell, network fallback |
| `icons/` | App icons (192, 512, maskable) |
| `assets/` | Images used by posts, e.g. the Crew Connect infrastructure diagram |

## Run locally

The service worker needs `http://`, not `file://`:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

**Vercel** — import the repo, framework preset *Other*, output directory `.`. No build command.

**GitHub Pages** — Settings → Pages → deploy from branch `main`, folder `/ (root)`.
If the site lands on a subpath (`/personal-site/`), the relative paths still resolve; only the
service worker scope narrows to that subpath, which is correct behaviour.

## Sections

Hero · Selected work · Experience · Stack · Writing · About · Contact

## Studio (write posts)

The **STUDIO** button in the nav opens a full editor:

- Sidebar: search, filter by all / live / drafts, select a post
- Markdown body with syntax-highlighted fenced code (```ts, ```py, ```sql)
- Insert helpers for image, link, YouTube, and code
- Live preview beside the editor on laptop widths, tabbed below that
- Publish / unpublish, two-step delete, word count and reading time
- Autosaves to the device as you type

Markdown extras beyond the usual:

```markdown
![caption text](./assets/diagram.png)     → figure with caption, click to open full size
[link text](https://example.com)          → accent-coloured link
https://www.youtube.com/watch?v=VIDEOID   → on its own line, becomes a video preview card
```

### Writing is client-side

Posts live in `localStorage` under `hlw_posts_v3`, seeded from the `SEED` array in
`index.html`. That means:

- Posts written in Studio stay on the device that wrote them.
- Visitors see the seeded posts.

To publish a post for everyone, write it in Studio, then copy it into the `SEED` array
and commit. To wire up a real backend later, replace `loadPosts()` and `save()` — they are
the only two functions that touch storage.

## Customising

| What | Where |
| --- | --- |
| Name, copy, sections | Markup in `index.html` |
| Seeded posts | `SEED` array near the top of the script |
| Accent colour, particle density, motion toggle, services section | `data-props` JSON on the script tag |
| Résumé download | `downloadResume()` — currently emits a placeholder text file; point it at a real PDF |

Theme follows the system preference and can be toggled in the nav; the choice persists
under `hlw_theme_v1`. Reduce-motion preferences are respected — the comet trail and GSAP
reveals switch off.
