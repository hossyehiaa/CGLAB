"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, AlertCircle, Check } from "lucide-react";
import { AuthShell } from "@/components/site/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  // Live password strength meter (pure visual, monochrome)
  const strength = React.useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);

  const strengthLabel = ["", "Weak", "Fair", "Strong", "Excellent"][strength];

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name || name.trim().length < 2)
      next.name = "Please enter your name (min 2 characters).";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter a valid email.";
    if (!password || password.length < 8)
      next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Create the account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error ?? "Could not create your account.");
        setLoading(false);
        return;
      }

      // 2. Sign them in immediately
      const signRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signRes?.error) {
        // Account was created but auto-signin failed — send them to login.
        toast.success("Account created. Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to Reelzak.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="(New) — Create account">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-display text-3xl md:text-4xl font-medium tracking-tight">
            Start your project.
          </h2>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">
            Create your client portal account. Takes thirty seconds — then
            you can submit your first brief.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-mono-label text-white/50">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mira Castellano"
              className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 text-base"
            />
            {errors.name && (
              <p className="text-xs text-white/60">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-mono-label text-white/50">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 text-base"
            />
            {errors.email && (
              <p className="text-xs text-white/60">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-mono-label text-white/50">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-12 bg-white/[0.02] border-white/10 focus:border-white/30 focus-visible:ring-white/20 placeholder:text-white/25 text-base"
            />

            {/* Strength meter */}
            {password && (
              <div className="pt-1 flex items-center gap-3">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor:
                          i <= strength
                            ? "rgba(255,255,255,0.85)"
                            : "rgba(255,255,255,0.10)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-white/45 w-16 text-right">
                  {strengthLabel}
                </span>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-white/60">{errors.password}</p>
            )}
          </div>

          {/* Form-level error */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-white/[0.02]"
            >
              <AlertCircle className="h-4 w-4 text-white/70 shrink-0 mt-0.5" />
              <p className="text-sm text-white/70">{formError}</p>
            </motion.div>
          )}

          {/* Terms */}
          <p className="text-xs text-white/40 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-white/70">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-white/70">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="group w-full h-12 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white underline underline-offset-4 hover:text-white"
          >
            Sign in
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
