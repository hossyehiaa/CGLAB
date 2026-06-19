"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Calendar as CalIcon, Plus, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StepIndicator } from "./step-indicator";
import { BRIEF_OBJECTIVES, BRIEF_STYLES } from "@/lib/orders";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BriefState {
  brandName: string;
  industry: string;
  objective: "" | "AWARENESS" | "SALES" | "EDUCATIONAL";
  style: string;
  targetAudience: string;
  keyMessage: string;
  referenceLinks: string[];
  additionalNotes: string;
  deadline: Date | undefined;
}

const INITIAL: BriefState = {
  brandName: "",
  industry: "",
  objective: "",
  style: "",
  targetAudience: "",
  keyMessage: "",
  referenceLinks: [],
  additionalNotes: "",
  deadline: undefined,
};

const STEPS = [
  { num: 1, label: "Brand" },
  { num: 2, label: "Objective" },
  { num: 3, label: "Style" },
  { num: 4, label: "Message" },
  { num: 5, label: "References" },
  { num: 6, label: "Schedule" },
];

// ---------------------------------------------------------------------------
// Per-step validation
// ---------------------------------------------------------------------------
function stepValid(step: number, s: BriefState): boolean {
  switch (step) {
    case 0:
      return s.brandName.trim().length >= 2 && s.industry.trim().length >= 2;
    case 1:
      return s.objective !== "";
    case 2:
      return s.style !== "";
    case 3:
      return (
        s.targetAudience.trim().length >= 4 && s.keyMessage.trim().length >= 4
      );
    case 4:
      return true; // optional
    case 5:
      return true; // deadline optional
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function BriefingForm() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [state, setState] = React.useState<BriefState>(INITIAL);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const completed = React.useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < step; i++) if (stepValid(i, state)) set.add(i);
    return set;
  }, [step, state]);

  const canAdvance = stepValid(step, state);

  function update<K extends keyof BriefState>(key: K, value: BriefState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (!canAdvance) return;
    setDirection(1);
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function back() {
    if (step === 0) return;
    setDirection(-1);
    setStep(step - 1);
  }

  async function submit() {
    if (!stepValid(STEPS.length - 1, state)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          deadline: state.deadline?.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not submit brief");
        setSubmitting(false);
        return;
      }
      toast.success("Brief submitted. Our team will be in touch within 24 hours.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // Per-step slide variants — the heart of the "flawless" feel
  const variants = {
    enter: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? 60 : -60,
      filter: "blur(6px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
    exit: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir === 1 ? -60 : 60,
      filter: "blur(6px)",
    }),
  };

  return (
    <div className="space-y-10">
      {/* ===================== STEP INDICATOR ===================== */}
      <StepIndicator steps={STEPS} current={step} completed={completed} />

      {/* ===================== FORM CARD ===================== */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-xl p-6 md:p-10 min-h-[460px] flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.35 },
              filter: { duration: 0.4 },
            }}
            className="flex-1"
          >
            {/* ---------- STEP 1: BRAND & INDUSTRY ---------- */}
            {step === 0 && (
              <StepShell
                num="01"
                title="Brand & industry"
                subtitle="Tell us who you are. This becomes the title of your order."
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Brand name" required>
                    <Input
                      autoFocus
                      value={state.brandName}
                      onChange={(e) => update("brandName", e.target.value)}
                      placeholder="e.g. Castellano Atelier"
                      className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25"
                    />
                  </Field>
                  <Field label="Industry" required>
                    <Input
                      value={state.industry}
                      onChange={(e) => update("industry", e.target.value)}
                      placeholder="e.g. Fashion / Luxury"
                      className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25"
                    />
                  </Field>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 2: OBJECTIVE ---------- */}
            {step === 1 && (
              <StepShell
                num="02"
                title="What should this reel achieve?"
                subtitle="Pick the single most important outcome. We shape the creative around it."
              >
                <div className="grid sm:grid-cols-3 gap-3">
                  {BRIEF_OBJECTIVES.map((obj) => {
                    const active = state.objective === obj.value;
                    return (
                      <button
                        key={obj.value}
                        type="button"
                        onClick={() => update("objective", obj.value as BriefState["objective"])}
                        className={`text-left rounded-xl p-5 border transition-all duration-300 ${
                          active
                            ? "border-white/40 bg-white/[0.06]"
                            : "border-white/10 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-lg font-medium tracking-tight">
                            {obj.label}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                              active
                                ? "bg-white border-white"
                                : "border-white/25"
                            }`}
                          >
                            {active && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="block h-full w-full rounded-full bg-black scale-[0.4]"
                              />
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {obj.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 3: STYLE ---------- */}
            {step === 2 && (
              <StepShell
                num="03"
                title="Pick a visual language."
                subtitle="The look and feel. You can refine later — this sets the initial direction."
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BRIEF_STYLES.map((s) => {
                    const active = state.style === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => update("style", s.value)}
                        className={`text-left rounded-xl p-5 border transition-all duration-300 group ${
                          active
                            ? "border-white/40 bg-white/[0.06]"
                            : "border-white/10 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-base font-medium tracking-tight">
                            {s.label}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                              active ? "bg-white border-white" : "border-white/25"
                            }`}
                          >
                            {active && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="block h-full w-full rounded-full bg-black scale-[0.4]"
                              />
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {s.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 4: AUDIENCE & MESSAGE ---------- */}
            {step === 3 && (
              <StepShell
                num="04"
                title="Audience & message"
                subtitle="The two most important inputs. Be specific — vague briefs make vague reels."
              >
                <div className="space-y-5">
                  <Field label="Target audience" required>
                    <Textarea
                      value={state.targetAudience}
                      onChange={(e) => update("targetAudience", e.target.value)}
                      placeholder="e.g. Affluent women 28-45 in urban centers who follow slow-fashion creators on Instagram."
                      className="min-h-[88px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none"
                    />
                    <CharCounter value={state.targetAudience} max={500} />
                  </Field>
                  <Field label="Key message" required>
                    <Textarea
                      value={state.keyMessage}
                      onChange={(e) => update("keyMessage", e.target.value)}
                      placeholder="e.g. Slow luxury — every stitch tells a story."
                      className="min-h-[88px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none"
                    />
                    <CharCounter value={state.keyMessage} max={500} />
                  </Field>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 5: REFERENCES ---------- */}
            {step === 4 && (
              <StepShell
                num="05"
                title="Reference links"
                subtitle="Optional. Drop any reels, videos, or pages that capture the energy you want."
              >
                <div className="space-y-3">
                  {state.referenceLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          value={link}
                          onChange={(e) => {
                            const next = [...state.referenceLinks];
                            next[i] = e.target.value;
                            update("referenceLinks", next);
                          }}
                          placeholder="https://instagram.com/reel/..."
                          className="h-11 pl-10 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "referenceLinks",
                            state.referenceLinks.filter((_, idx) => idx !== i),
                          )
                        }
                        className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all duration-300"
                        aria-label="Remove link"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {state.referenceLinks.length < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        update("referenceLinks", [...state.referenceLinks, ""])
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white border border-dashed border-white/15 hover:border-white/30 rounded-full transition-all duration-300"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add reference
                    </button>
                  )}

                  <Field label="Anything else? (optional)" className="pt-4">
                    <Textarea
                      value={state.additionalNotes}
                      onChange={(e) => update("additionalNotes", e.target.value)}
                      placeholder="Tone, must-haves, brand colors to avoid, music preferences, voiceover direction..."
                      className="min-h-[88px] bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 resize-none"
                    />
                    <CharCounter value={state.additionalNotes} max={2000} />
                  </Field>
                </div>
              </StepShell>
            )}

            {/* ---------- STEP 6: DEADLINE ---------- */}
            {step === 5 && (
              <StepShell
                num="06"
                title="When do you need it?"
                subtitle="Pick a target delivery date. We'll confirm feasibility within 24 hours."
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div className="flex justify-center md:justify-start">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full h-12 px-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/25 transition-all duration-300 text-left"
                        >
                          <CalIcon className="h-4 w-4 text-white/50" />
                          {state.deadline ? (
                            <span className="text-sm text-white/90">
                              {format(state.deadline, "EEEE, MMM d, yyyy")}
                            </span>
                          ) : (
                            <span className="text-sm text-white/40">
                              Pick a delivery date
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-popover/95 backdrop-blur-2xl border-white/10"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={state.deadline}
                          onSelect={(d) => update("deadline", d)}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="bg-transparent text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Summary card */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                    <p className="text-mono-label text-white/45">Order summary</p>
                    <div className="space-y-2 text-sm">
                      <Row k="Brand" v={state.brandName || "—"} />
                      <Row k="Industry" v={state.industry || "—"} />
                      <Row
                        k="Objective"
                        v={
                          BRIEF_OBJECTIVES.find((o) => o.value === state.objective)
                            ?.label || "—"
                        }
                      />
                      <Row
                        k="Style"
                        v={
                          BRIEF_STYLES.find((s) => s.value === state.style)?.label ||
                          "—"
                        }
                      />
                      <Row
                        k="References"
                        v={`${state.referenceLinks.filter(Boolean).length} link(s)`}
                      />
                      <Row
                        k="Target"
                        v={
                          state.deadline
                            ? format(state.deadline, "MMM d, yyyy")
                            : "No deadline"
                        }
                      />
                    </div>
                    <p className="text-xs text-white/40 pt-2 border-t border-white/[0.06]">
                      Standard turnaround is 5 business days. Monthly plans
                      ship in 3. Studio tier ships in 48 hours.
                    </p>
                  </div>
                </div>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===================== NAV BUTTONS ===================== */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0 || submitting}
          className="h-11 px-5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-white/40 font-mono">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              disabled={!canAdvance}
              className="group h-11 px-6 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="group h-11 px-6 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit brief
                  <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function StepShell({
  num,
  title,
  subtitle,
  children,
}: {
  num: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-7">
      <div>
        <p className="text-mono-label text-white/40 mb-3">Step {num}</p>
        <h2 className="text-display text-2xl md:text-3xl font-medium tracking-tight leading-[1.15]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed max-w-lg">
          {subtitle}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-mono-label text-white/55">
        {label}
        {required && <span className="text-white/40 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  return (
    <div className="flex justify-end">
      <span className="text-[10px] text-white/35 font-mono">
        {value.length}/{max}
      </span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-white/45">{k}</span>
      <span className="text-white/85 text-right truncate max-w-[60%]">{v}</span>
    </div>
  );
}
