# Fakhrul Alam — Portfolio (Phase 2 Roadmap & Architecture)

> **Document Type:** Phase 2 Technical Blueprint & Implementation Guide  
> **Target Application:** Full-Stack Dynamic Portfolio with Admin Dashboard  
> **Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Firebase (Firestore, Storage, Auth)

---

## 📌 Executive Summary

This document outlines the complete migration strategy and system architecture for transitioning Fakhrul Alam's portfolio from a static design prototype into a dynamic, production-ready web application powered by **Next.js 15** and **Firebase**.

The goal is to preserve the approved **dark cinematic / HUD blueprint aesthetic** while introducing a non-technical admin panel (`/admin`) for content management, image optimization pipelines, and Firestore caching.

---

## 🏗️ Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 (App Router)                  │
│                     Hosted on Vercel (Free)                 │
│                                                             │
│   /              ──>  Public Portfolio (SSR / ISR)          │
│   /admin         ──>  Protected Admin Dashboard             │
│   /admin/login   ──>  Firebase Email/Password Auth          │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
      ┌─────────────────┐             ┌──────────────────┐
      │ Cloud Firestore │             │ Firebase Storage │
      │   (Text Data)   │             │   (Media Files)  │
      └─────────────────┘             └──────────────────┘
```

---

## 🗄️ Firestore Database Schema

### 1. `projects` Collection
```typescript
interface Project {
  id?: string;
  title: string;
  category: 'game-asset' | '3d-viz' | 'graphic-design' | 'photography';
  description?: string;
  imageUrl: string;
  imagePath: string; // Required for deletion from Storage
  width: number;     // Critical to prevent Cumulative Layout Shift (CLS) in Masonry
  height: number;
  order: number;     // Manual sorting index
  createdAt: any;
}
```

### 2. `achievements` Collection
```typescript
interface Achievement {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
  imagePath: string;
  order: number;
}
```

### 3. `siteContent/main` (Single Document)
```typescript
interface SiteContent {
  heroTitle: string;
  heroLede: string;
  aboutPara1: string;
  aboutPara2: string;
  stats: Array<{ value: number; label: string }>;
  timeline: Array<{ date: string; title: string; text: string }>;
  socials: {
    facebook: string;
    linkedin: string;
    artstation: string;
    behance: string;
    instagram: string;
  };
  email: string;
}
```

---

## 🛡️ Security Rules

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ⚡ Zero-UI-Change Optimizations (Under-the-Hood)

1. **Client-Side WebP Compression:**
   - Compress raw 4K/high-res renders down to ~300-500KB before sending to Firebase Storage.
   - Saves storage quotas and drastically improves mobile load times.

2. **Zero-CLS Masonry Layout:**
   - Image dimensions (`width` and `height`) calculated on upload and stored in Firestore.
   - Ensures `next/image` reserves exact aspect ratios during rendering.

3. **Firestore Offline & Memory Cache:**
   - Multi-tab offline persistence enabled via `persistentLocalCache`.
   - Subsequent page visits load instantly with zero additional read units consumed.

4. **Dynamic OpenGraph / Twitter Cards:**
   - Rich link preview generation for Facebook, LinkedIn, Discord, and ArtStation shares.

5. **Graceful Error Boundaries:**
   - Isolated section fail-safes without crashing the main application UI.

---

## 📋 Implementation Checklist

- [ ] Obtain high-resolution source images (~180 assets) from artist.
- [ ] Initialize Next.js 15 repository with TypeScript and Tailwind CSS.
- [ ] Configure Firebase project (`Auth`, `Firestore`, `Storage`).
- [ ] Seed base profile content into Firestore (`siteContent/main`).
- [ ] Implement responsive components (`Header`, `Hero`, `Skills`, `Gallery`, `Lightbox`, `Contact`).
- [ ] Build `/admin` panel with drag-and-drop upload and dimension extraction.
- [ ] Verify Lighthouse Performance (>85) and Accessibility (>95) on mobile devices.
- [ ] Connect custom domain and deploy to Vercel.
