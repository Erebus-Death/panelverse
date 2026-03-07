# PanelVerse

A fast, static manga/manhwa reading platform. Built with Next.js 14.

---

## How to run locally

```bash
npm install
npm run dev        # → http://localhost:3000
```

## How to deploy (free, auto)

1. Push this repo to GitHub
2. Go to vercel.com → New Project → import your repo
3. Vercel detects Next.js automatically — click Deploy
4. Every `git push` after that auto-redeploys. Done.

---

## Adding your first series (or any new series)

### Step 1 — Create the folder

```
content/series/YOUR-SERIES-SLUG/
├── index.md          ← series info
└── chapters/
    └── 01.md         ← chapter metadata
```

Slug rules: lowercase, hyphens only. E.g. `solo-leveling`, `tower-of-god`

### Step 2 — Fill in index.md

```yaml
---
title: "Your Series Title"
slug: "your-series-slug"
author: "Author Name"
artist: "Artist Name"
status: "ongoing"          # or "completed"
year: 2024
genres:
  - Action
  - Fantasy
cover: "/images/your-series-slug/cover.jpg"   # optional at first
description: >
  Your series description here. Can be multiple lines.
chapters:
  - num: 1
    title: "Chapter Title"
    date: "2024-01-15"
    pages: 32
---
```

### Step 3 — Add chapter images

Put your page images in:
```
public/images/YOUR-SERIES-SLUG/ch01/
    001.jpg
    002.jpg
    003.jpg
    ...
```

Naming rules:
- Folder: `ch01`, `ch02`, `ch10`, `ch100` (padded to 2 digits minimum)
- Files: `001.jpg`, `002.jpg` ... (sorted alphabetically = reading order)
- Formats: .jpg, .jpeg, .png, .webp all work

### Step 4 — Add the cover (optional but recommended)

```
public/images/YOUR-SERIES-SLUG/cover.jpg
```

Then set `cover: "/images/your-series-slug/cover.jpg"` in index.md.
If you skip this, a colour placeholder shows automatically.

### Step 5 — Push to GitHub

```bash
git add .
git commit -m "add series: your-series-slug"
git push
```

Vercel rebuilds and deploys in ~30 seconds. Your new series is live.

---

## Adding a new chapter to an existing series

1. Add the chapter entry to `chapters:` in `content/series/[slug]/index.md`:
```yaml
chapters:
  - num: 1
    title: "The Truck of Fate"
    date: "2024-01-15"
    pages: 36
  - num: 2                      # ← add this
    title: "New Chapter Title"
    date: "2024-02-01"
    pages: 30
```

2. Add images to `public/images/[slug]/ch02/`

3. `git push` → live in 30 seconds.

---

## File structure explained

```
panelverse/
│
├── content/                   ← YOUR CONTENT. Never touch anything else for new series.
│   └── series/
│       └── overpowered-hero/
│           ├── index.md       ← series metadata + chapter list
│           └── chapters/      ← (optional per-chapter md files)
│
├── public/
│   └── images/
│       └── overpowered-hero/
│           ├── cover.jpg      ← series cover
│           └── ch01/          ← chapter 1 images
│               ├── 001.jpg
│               └── 002.jpg
│
├── src/
│   ├── lib/
│   │   └── content.js         ← reads markdown files (build-time only)
│   ├── components/
│   │   ├── Nav.js             ← shared nav bar
│   │   ├── Footer.js          ← shared footer
│   │   └── SeriesCard.js      ← card used in grids
│   └── pages/
│       ├── index.js           ← homepage  /
│       └── series/
│           ├── [slug].js      ← series page  /series/overpowered-hero
│           └── [slug]/
│               └── chapter/
│                   └── [num].js  ← reader  /series/overpowered-hero/chapter/1
│
└── styles/
    └── globals.css            ← all styles
```

---

## Why this is fast (no server overload)

```
You push to GitHub
        ↓
Vercel runs: next build
        ↓
Every page pre-rendered to plain HTML
(100 series × 50 chapters = 5,000 pages built once)
        ↓
Stored on Cloudflare CDN globally
        ↓
User visits → instant static file served
No database. No server per request. Zero cost.
```

Images are served directly from the CDN too.
Next.js <Image> auto-converts to WebP/AVIF and lazy-loads pages 4+ automatically.

---

## When you outgrow this

| Situation                        | Solution                                  |
|----------------------------------|-------------------------------------------|
| 1000+ chapters, build gets slow  | Enable ISR (already set, revalidate: 60)  |
| Want a CMS instead of markdown   | Swap content.js to call Contentful API    |
| Need user accounts / bookmarks   | Add NextAuth + PlanetScale (free tier)    |
| Images getting large             | Move to Cloudflare Images ($5/mo)         |
| More traffic                     | Vercel handles it — no config needed      |

---

## Quick commands

```bash
npm run dev      # local dev server
npm run build    # test production build
npm start        # run production build locally
```
