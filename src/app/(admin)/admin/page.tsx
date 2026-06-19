import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function AdminPlaceholder() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <main className="flex-1 flex items-center justify-center p-10">
      <div className="max-w-md text-center space-y-6">
        <p className="text-mono-label text-white/40">
          Step 3 complete · Step 5 pending
        </p>
        <h1 className="text-display text-4xl font-medium tracking-tight">
          Admin access
          <br />
          <span className="text-serif-italic text-white/70">granted.</span>
        </h1>
        <p className="text-sm text-white/50 leading-relaxed">
          You're signed in as <span className="text-white/80">{user.email}</span>.
          The admin dashboard — incoming briefs, status pipeline, and file
          upload — arrives in Step 5.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline" className="rounded-full border-white/15">
              Back to home
            </Button>
          </Link>
          <Link
            href="/api/auth/signout"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Sign out
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
