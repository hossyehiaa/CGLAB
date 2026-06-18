"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BRAND } from "@/lib/brand";
import { ORDER_STATUS_FLOW, ORDER_STATUS_META } from "@/types/domain";
import {
  Sparkles,
  Film,
  Wand2,
  Clapperboard,
  CheckCircle2,
  ArrowRight,
  Github,
  Database,
  Palette,
} from "lucide-react";

/**
 * STEP 1 PREVIEW PAGE
 * Showcases the cinematic dark theme, fonts, gradients, and component styling
 * before we build out the actual landing page in Step 2.
 */
export default function Home() {
  return (
    <main className="flex-1">
      {/* ===================== TOP BAR ===================== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/reelzak-mark.svg"
              alt="Reelzak logo mark"
              className="h-9 w-9"
            />
            <span className="font-display text-xl font-bold tracking-tight">
              {BRAND.name}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <span>Step 1 of 5</span>
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">
              Foundation Complete
            </Badge>
          </div>
        </div>
      </header>

      {/* ===================== HERO PREVIEW ===================== */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge
            variant="outline"
            className="mb-6 border-amber-500/30 bg-amber-500/5 text-amber-300"
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            Step 1 — Foundation Ready
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            The cinematic theme
            <br />
            <span className="text-gradient-gold">is alive.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Tailwind tokens, Space Grotesk + Inter typography, amber-on-charcoal
            palette, glow utilities, and shadcn/ui — all wired up. The
            foundation for your Reelzak productized service is ready to build on.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold"
            >
              Approve & Continue to Step 2
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/60 hover:bg-secondary/60"
            >
              View the Theme Specs
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ===================== WHAT WAS BUILT ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Palette,
              title: "Cinematic Theme",
              body: "Dark-first palette: deep charcoal base, amber/gold primary, magenta/violet accent. Custom glow, gradient-text, and film-grain utilities.",
            },
            {
              icon: Database,
              title: "Prisma Schema",
              body: "User, Order, OrderStatusUpdate, and Package models defined — with a 6-stage order flow that mirrors your production pipeline.",
            },
            {
              icon: Github,
              title: "Vercel + Neon Ready",
              body: "Env example covers SQLite (local) and Neon PostgreSQL (prod). Schema provider is one line to swap when you deploy.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <Card className="h-full border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-2">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="font-display text-lg">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== ORDER STATUS SYSTEM ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clapperboard className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">
              Order Status Pipeline
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
            Every order moves through six stages. These are the exact badges and
            labels that will appear on the Client Dashboard and Admin Dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {ORDER_STATUS_FLOW.map((status, i) => {
              const meta = ORDER_STATUS_META[status];
              return (
                <React.Fragment key={status}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="flex flex-col items-start gap-1"
                  >
                    <Badge
                      className={`${meta.color} border px-3 py-1 text-xs font-medium`}
                    >
                      {meta.label}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground max-w-[120px] leading-tight">
                      {meta.description}
                    </span>
                  </motion.div>
                  {i < ORDER_STATUS_FLOW.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== TYPOGRAPHY & COLOR SPEC ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Typography */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Typography
              </CardTitle>
              <CardDescription>
                Space Grotesk for display, Inter for body
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Display / H1
                </p>
                <p className="font-display text-4xl font-bold tracking-tight text-gradient-gold">
                  Make Reels That Move
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Body / Inter
                </p>
                <p className="text-base leading-relaxed">
                  Submit a brief, our team ideates, generates, and edits — you
                  receive a cinematic reel ready to publish.
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Mono / Geist Mono
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  order_number: RZK-2026-0001
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Color tokens */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Color Tokens
              </CardTitle>
              <CardDescription>
                Amber primary · Magenta accent · Charcoal base
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              {[
                { name: "Primary", cls: "bg-primary", text: "text-primary-foreground" },
                { name: "Accent", cls: "bg-accent", text: "text-accent-foreground" },
                { name: "Secondary", cls: "bg-secondary", text: "text-secondary-foreground" },
                { name: "Card", cls: "bg-card border border-border", text: "text-card-foreground" },
                { name: "Muted", cls: "bg-muted", text: "text-muted-foreground" },
                { name: "Destructive", cls: "bg-destructive", text: "text-white" },
              ].map((sw) => (
                <div
                  key={sw.name}
                  className={`rounded-lg p-3 ${sw.cls} ${sw.text} h-20 flex flex-col justify-between`}
                >
                  <span className="text-xs font-medium">{sw.name}</span>
                  <span className="text-[10px] opacity-70 font-mono">
                    {sw.cls}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================== COMPONENT PREVIEW STRIP ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">
              shadcn/ui — already styled to match
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button className="glow-gold">Glow</Button>
            <Badge>Default</Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30">
              Primary
            </Badge>
            <Badge className="bg-accent/15 text-accent border-accent/30">
              Accent
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="mt-auto border-t border-border/50 bg-background/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <span>
              {BRAND.name} · {BRAND.tagline}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>Step 1/5 — Foundation</span>
            <span className="text-muted-foreground/60">Next: Landing Page</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
