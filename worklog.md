---
Task ID: step-1
Agent: main (Super Z)
Task: Step 1 — Initialize the Next.js project and set up the global theme, Tailwind config, and basic layout for Reelzak.

Work Log:
- Loaded the fullstack-dev skill and initialized the project environment.
- Audited the existing scaffold: Next.js 16 + TS + Tailwind 4 + shadcn/ui + Prisma + Framer Motion + NextAuth + next-themes + Zustand all already installed.
- Designed the cinematic dark theme: deep charcoal base (oklch 0.13 0.006 280) + amber/gold primary (oklch 0.83 0.16 75) + magenta/violet accent (oklch 0.68 0.24 320). Avoided indigo/blue per skill rules.
- Rewrote `src/app/globals.css` with full light + dark token sets, a `.reelzak-bg` radial-gradient backdrop, a `.reelzak-grain` film-grain overlay, and custom utilities: `.text-gradient-gold`, `.text-gradient-accent`, `.border-gradient-gold`, `.glow-gold`, `.glow-accent`, `.scrollbar-reelzak`.
- Extended `tailwind.config.ts` with `font-display` (Space Grotesk) and `font-sans` (Inter), plus custom keyframes for fade-up / fade-in / scale-in / shimmer / pulse-glow / float.
- Created `src/components/providers/theme-provider.tsx` — wraps next-themes with `defaultTheme="dark"` and `enableSystem={false}` so the cinematic theme is always on.
- Rewrote `src/app/layout.tsx` — wired Inter + Space Grotesk + Geist Mono fonts, set `<html className="dark">`, applied `reelzak-bg reelzak-grain` backdrop to body, mounted ThemeProvider + Toaster + Sonner (dark), updated metadata for Reelzak SEO.
- Updated `prisma/schema.prisma` with the full domain: User (with Role enum), Order (with OrderStatus enum), OrderStatusUpdate (audit trail), Package (pricing tiers). Six-stage status flow: PENDING -> IDEATION -> AI_GENERATION -> EDITING -> READY_FOR_REVIEW -> DELIVERED.
- Ran `bun run db:push` — schema applied successfully to local SQLite, Prisma Client generated.
- Created `src/types/domain.ts` — shared TS types + ORDER_STATUS_META badge color map + ORDER_STATUS_FLOW array.
- Created `src/lib/brand.ts` — BRAND constant, PRICING_PACKAGES array (Single $149 / Creator $499 / Studio $1199), FAQ_ITEMS array.
- Created `public/reelzak-mark.svg` (square logo mark) and `public/reelzak-logo.svg` (horizontal wordmark) — both gradient amber/gold.
- Created `.env.example` documenting SQLite (local) vs Neon PostgreSQL (prod) swap, NextAuth secret, and Vercel Blob token for file uploads.
- Wrote a "Step 1 complete" preview page at `src/app/page.tsx` that showcases: hero with gradient text, three "what was built" cards, full Order Status Pipeline visualization with badges, typography + color token swatches, shadcn/ui button + badge strip.
- Updated `next.config.ts` with `allowedDevOrigins: ["*.space-z.ai"]` to silence cross-origin dev warnings.
- Ran `bun run lint` — 0 errors, 0 warnings.
- Ran Agent Browser self-verification: opened `http://localhost:3000`, page returned 200, title set correctly, all interactive elements (heading, CTA buttons, status pipeline section, shadcn button strip) rendered, no console errors, no runtime errors. Screenshot saved to `download/step1-preview.png`.

Stage Summary:
- Foundation complete: theme + layout + Prisma schema + brand constants + types + env config.
- Dev server responding `GET / 200` cleanly on port 3000.
- Screenshot of the cinematic theme preview: `/home/z/my-project/download/step1-preview.png`
- Ready for Step 2 (Landing Page) upon user approval.
