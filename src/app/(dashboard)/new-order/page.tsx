import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/site/dashboard-shell";
import { BriefingForm } from "@/components/site/briefing-form/briefing-form";

export default async function NewOrderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT") redirect("/admin");

  return (
    <DashboardShell areaLabel="Client Portal" backHref="/dashboard">
      {/* Header */}
      <section className="mb-10 md:mb-14">
        <p className="text-mono-label text-white/40 mb-4">
          New order
        </p>
        <h1 className="text-display text-4xl md:text-5xl tracking-tight font-medium leading-[1.05]">
          Submit a{" "}
          <span className="text-serif-italic text-white/70">brief.</span>
        </h1>
        <p className="mt-3 max-w-xl text-base text-white/50 leading-relaxed">
          Six steps. Two minutes. Once submitted, our team starts ideating
          within 24 hours.
        </p>
      </section>

      {/* Form */}
      <BriefingForm />
    </DashboardShell>
  );
}
