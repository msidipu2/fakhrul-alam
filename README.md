# Fakhrul Alam — Portfolio

> A modern, high-performance personal portfolio website for **Fakhrul Alam**, a 3D Generalist, 3D Game Assets Artist, and Multimedia Designer.

---

## 📌 Project Overview

This web portfolio showcases 3D art, hard-surface game assets, architectural/product visualizations, commercial video reels, and creative multimedia designs. It is built using the latest **Next.js App Router (Turbopack)**, **React 19**, **Tailwind CSS v4**, and modern UI components.

- **Developer / Artist:** Fakhrul Alam
- **Role:** 3D Generalist · 3D Game Assets Artist · Multimedia Designer
- **Theme & Aesthetic:** Sleek dark-mode blueprint / technical HUD design with glassmorphism, glowing accents, and smooth micro-interactions.

---

## 🛠️ Technology Stack

| Category | Technologies / Tools |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) |
| **Library** | [React 19](https://react.dev/) / React DOM |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS |
| **Icons & UI** | [Lucide React](https://lucide.dev/), [Base UI](https://base-ui.com/), class-variance-authority, clsx, tailwind-merge |
| **3D & Design Stack (Artist)** | Blender, Substance Painter, Unreal Engine, Marmoset Toolbag, Adobe Creative Suite (Photoshop, Illustrator, After Effects, InDesign) |
| **Analytics** | [@vercel/analytics](https://vercel.com/analytics) |

---

## 📂 Project Architecture

```
fakhrul-alam-portfolio/
├── app/
│   ├── globals.css          # Global CSS variables, HUD effects & custom styles
│   ├── layout.tsx           # Root HTML structure, typography, metadata & analytics
│   └── page.tsx             # Main landing page assembling all sections
├── components/
│   ├── about.tsx            # About story & client grid
│   ├── count-up.tsx         # Animated numerical count-up statistics
│   ├── expertise.tsx        # Breakdown of core skills (Game Assets, Visualization, Graphic Design)
│   ├── hero.tsx             # Hero banner with render showcase, stats & quick links
│   ├── journey.tsx          # Career & artistic milestone timeline
│   ├── reel-gallery.tsx     # Showreel grid & interactive lightbox modal for videos/renders
│   ├── reveal.tsx           # Scroll reveal animation wrapper
│   ├── section-label.tsx    # Monospace technical section tags
│   ├── site-footer.tsx      # Contact section & social profile links
│   ├── site-nav.tsx         # Fixed navigation bar with mobile menu support
│   └── ui/                  # Reusable UI primitives (dialog, button, etc.)
├── lib/
│   ├── site-content.ts      # Centralized data store for profile info, reels, journey, socials
│   └── utils.ts             # Utility helper functions (cn class combiner)
├── public/
│   ├── renders/             # 3D render images and reel posters
│   └── reel/                # Video files (.mp4) for showreel playback
├── package.json             # Scripts & dependency definitions
├── postcss.config.mjs       # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.mjs          # Next.js configuration
```

---

## 🌟 Key Sections & Features

1. **Header / Navigation (`SiteNav`)**:
   - Fixed blur header with quick navigation to all sections (`#about`, `#expertise`, `#reel`, `#journey`, `#contact`).
   - Mobile-responsive navigation drawer.

2. **Hero Section (`Hero`)**:
   - High-impact headline and technical blueprint grid background.
   - Interactive 3D render showcase frame with technical HUD diagnostics (Cycles, 512 spp, 4K resolution readout).
   - Key stats: **30+ 3D Models**, **10+ 3D Visualizations**, **100+ Creative Designs**.
   - Direct links to social profiles (Facebook, LinkedIn, ArtStation, Behance, Instagram).

3. **About Section (`About`)**:
   - Artistic journey narrative and background story.
   - Client slots and collaboration roster.

4. **Expertise (`Expertise`)**:
   - **01. 3D Game Asset:** Low/high poly modeling, clean topology, UV unwrapping, PBR textures (Blender, Substance Painter, Marmoset, Unreal Engine).
   - **02. 3D Visualization:** Lighting studies, architectural visualization, look development (Cycles, Corona, Photoshop).
   - **03. Graphic Design:** Brand design, campaign assets, print & social media layouts (Illustrator, Photoshop, After Effects, InDesign).

5. **Reel Gallery (`ReelGallery`)**:
   - Dynamic grid showcasing video projects and high-resolution renders (e.g. hard-surface assets, character sculpts, lighting studies, commercial ads).
   - Built-in modal lightbox with video player and still zoom functionality.

6. **Milestone Journey (`Journey`)**:
   - Interactive timeline highlighting key turning points from early digital design (2013), photography (2015), to 3D modeling mastery (2020+).

7. **Footer & Contact (`SiteFooter`)**:
   - Direct contact call-to-action with social links and copyright info.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.17+ or v20+) installed on your machine.

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Fakhrul-alam-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the local development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```
*(If port 3000 is occupied, Next.js will automatically launch on `http://localhost:3001`)*.

---

## 📦 Available Scripts

- **`npm run dev`**: Starts the Next.js development server with Turbopack.
- **`npm run build`**: Compiles and builds the application for production.
- **`npm run start`**: Starts the production server after building.

---

## ⚙️ Customization & Updating Content

All text, bio, social links, portfolio items, and timeline milestones can be edited in a single file:
👉 **[`lib/site-content.ts`](file:///c:/Users/User/Desktop/Fakhrul-alam-portfolio/lib/site-content.ts)**

- **Profile & Bio:** Edit `profile` object.
- **Social Links:** Modify URLs in `socials` array.
- **Showreel & 3D Assets:** Update entries in `reel` array.
- **Media Files:** Place new images inside `/public/renders/` and videos inside `/public/reel/`.

---

## 🚢 Deployment

The project can be deployed seamlessly to [Vercel](https://vercel.com/):

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into Vercel.
3. The framework preset will automatically detect Next.js.
4. Click **Deploy**.

---

## 🗺️ Phase 2 Roadmap

For detailed architecture, Firebase schema, security rules, and dynamic admin panel specifications, see:  
👉 **[`PHASE2_ROADMAP.md`](file:///c:/Users/User/Desktop/Fakhrul-alam-portfolio/PHASE2_ROADMAP.md)**

