# Fakhrul Alam Portfolio — Detailed Project Specification

## 1. Executive Summary
This document provides full technical, architectural, and content specifications for the **Fakhrul Alam Personal Portfolio** web application.

---

## 2. Project Metadata
- **Project Name:** `my-project` / Fakhrul Alam Portfolio
- **Target Audience:** Game studios, CGI/VFX production houses, architectural clients, creative agencies, and recruiters.
- **Primary Focus:** Hard-surface 3D game assets, 3D visualization renders, commercial ads/reels, and multimedia branding.

---

## 3. Technology Stack & Dependencies

### Core Frameworks & Runtime
- **Framework:** Next.js (16.3.0) with Turbopack bundler
- **Runtime:** React 19.x & React-DOM 19.x
- **Language:** TypeScript 5.7.3

### Styling & Design System
- **CSS Framework:** Tailwind CSS v4.3.3
- **CSS Post-processor:** `@tailwindcss/postcss` & `postcss`
- **Utility Libraries:** `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`
- **UI Components:** `@base-ui/react`, `lucide-react` icons

### Analytics & Telemetry
- `@vercel/analytics`

---

## 4. Architecture & Component Structure

```
├── app/
│   ├── globals.css         # Custom utility tokens, blueprint grid backgrounds, HUD aesthetics
│   ├── layout.tsx          # Font optimization, metadata setup, Vercel Analytics integration
│   └── page.tsx            # Single-page layout connecting all components
│
├── components/
│   ├── site-nav.tsx        # Top fixed navbar with backdrop blur and responsive mobile drawer
│   ├── hero.tsx            # Hero section with headline, HUD diagnostics frame, 3D stats & CTA
│   ├── about.tsx           # Artist biography, origin story, and client grid
│   ├── expertise.tsx       # 3 core domains (Game Assets, Visualization, Graphic Design) with tool tags
│   ├── reel-gallery.tsx    # Filterable/expandable showcase with video playback & lightbox modal
│   ├── journey.tsx         # Chronological milestones from 2013 to present
│   ├── site-footer.tsx     # Contact details, socials, and copyright
│   ├── count-up.tsx        # Animated numerical counter for stats
│   ├── reveal.tsx          # IntersectionObserver scroll reveal wrapper
│   └── section-label.tsx   # Monospaced section indicator badges
│
├── lib/
│   ├── site-content.ts     # Single source of truth for all content and portfolio data
│   └── utils.ts            # Helper function for merging CSS classnames
│
└── public/
    ├── renders/            # Static 3D artwork images (.png/.jpg)
    └── reel/               # Video reels (.mp4)
```

---

## 5. Content Configuration Guide (`lib/site-content.ts`)

| Data Object | Description | Key Fields |
| :--- | :--- | :--- |
| `profile` | Artist identity and headline | `name`, `greeting`, `role` |
| `stats` | Quantitative metrics | `value`, `title`, `note` |
| `socials` | External links | `label`, `href` (Facebook, LinkedIn, ArtStation, Behance, Instagram) |
| `aboutStory` | Narrative bio | Long-form background text |
| `expertise` | Technical specializations | `index`, `title`, `description`, `tools` |
| `reel` | Portfolio items & reels | `file`, `title`, `poster`, `alt`, `featured`, `src` |
| `journey` | Career milestones | `date`, `year`, `title`, `description` |

---

## 6. How to Run & Build

### Development Mode
```bash
npm run dev
```
Launches server at `http://localhost:3000` (or `http://localhost:3001`).

### Production Build
```bash
npm run build
npm run start
```
