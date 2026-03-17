# AeroDesk — Pre-Owned Aircraft Marketplace

## Project Overview
AeroDesk is a modern digital marketplace for pre-owned aircraft, targeting Brazil first (LABACE 2026 launch), then LatAm, then global. Think "Webmotors for aviation." The platform must be mobile-first, bilingual (PT-BR primary, EN secondary), and deliver a premium UX that makes Controller.com look outdated.

## Tech Stack
- Frontend: Next.js 15 (App Router), TypeScript strict, Tailwind CSS 4, Framer Motion
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
- Search: Supabase full-text search (migrate to Typesense later)
- Payments: Stripe
- AI: Claude API for pricing engine
- Hosting: Vercel (web), Supabase (backend), Cloudflare R2 (images)
- Analytics: PostHog

## Design System
- Colors: Navy #0F172A, Blue #2563EB, Blue Light #3B82F6, Sky #0EA5E9, Slate #64748B, Background #F1F5F9
- Font: Inter for body, display font for headings
- Border radius: 12px cards, 8px buttons, 6px inputs
- Mobile-first: every page designed for iPhone 13 width first
- Inspiration: Webmotors.com.br, Carvana, Airbnb listing pages

## Coding Standards
- TypeScript strict mode, no any types
- Functional components only with hooks
- Tailwind for all styling, no CSS modules
- File naming: kebab-case for files, PascalCase for components
- Zod for all validation
- All tables must have: id (uuid), created_at, updated_at
- Use Row Level Security on all Supabase tables
- Conventional commits: feat:, fix:, chore:, docs:

## Domain Terms
- Listing = aircraft for sale
- Dealer = professional broker with subscription
- Lead = buyer inquiry on a listing
- PPI = Pre-Purchase Inspection
- TT = Total Time (airframe hours)
- SMOH = Since Major Overhaul (engine hours)
