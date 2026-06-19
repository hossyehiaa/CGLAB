"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Loader2,
  UploadCloud,
  FileVideo,
  Check,
  ChevronRight,
  Link2,
  Calendar,
  User,
  Building2,
  Target,
  Palette,
  MessageSquare,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_META,
  type OrderStatus,
} from "@/types/domain";
import { format, parseISO, isValid } from "date-fns";

interface AdminOrder {
  id: string;
  orderNumber: string;
  brandName: string;
  industry: string | null;
  briefDetails: string;
  status: OrderStatus;
  deadline: string | null;
  deliveryFileUrl: string | null;
  deliveryFileName: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string | null;
    email: string;
    brandName: string | null;
  };
}

interface OrderDetailDrawerProps {
  order: AdminOrder;
  onClose: () => void;
  onMutated: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseBrief(raw: string): Record<string, any> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  const date = parseISO(d);
  if (!isValid(date)) return "—";
  return format(date, "MMM d, yyyy · h:mm a");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function OrderDetailDrawer({
  order,
  onClose,
  onMutated,
}: OrderDetailDrawerProps) {
  const brief = parseBrief(order.briefDetails);
  const [updatingStatus, setUpdatingStatus] = React.useState<OrderStatus | null>(null);

  // Lock body scroll while the drawer is open
  React.useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Escape to close
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus = ORDER_STATUS_FLOW[currentIdx + 1] ?? null;
  const isDelivered = order.status === "DELIVERED";

  async function advanceTo(target: OrderStatus) {
    setUpdatingStatus(target);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Could not update status");
        return;
      }
      toast.success(`Status → ${ORDER_STATUS_META[target].label}`);
      onMutated();
    } catch {
      toast.error("Network error");
    } finally {
      setUpdatingStatus(null);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[560px] lg:w-[640px] bg-background border-l border-white/[0.08] flex flex-col"
      >
        {/* ===================== HEADER ===================== */}
        <div className="shrink-0 flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div>
            <p className="font-mono text-xs text-white/45 tracking-wide mb-1.5">
              {order.orderNumber}
            </p>
            <h2 className="text-display text-2xl font-medium tracking-tight">
              {order.brandName}
            </h2>
            {order.industry && (
              <p className="text-xs text-white/45 mt-1">{order.industry}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all duration-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ===================== SCROLL BODY ===================== */}
        <div className="flex-1 overflow-y-auto scrollbar-reelzak">
          {/* ---------- CURRENT STATUS + ADVANCE ---------- */}
          <section className="p-6 border-b border-white/[0.06]">
            <p className="text-mono-label text-white/40 mb-4">
              Current status
            </p>
            <div className="flex items-center justify-between gap-4 mb-5">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${ORDER_STATUS_META[order.status].color}`}
              >
                <span className={`h-2 w-2 rounded-full ${ORDER_STATUS_META[order.status].dot}`} />
                {ORDER_STATUS_META[order.status].label}
              </span>
              <span className="text-xs text-white/40">
                Step {currentIdx + 1} / {ORDER_STATUS_FLOW.length}
              </span>
            </div>

            {/* Pipeline visualization */}
            <div className="flex items-center gap-1 mb-6">
              {ORDER_STATUS_FLOW.map((s, i) => {
                const done = i < currentIdx;
                const current = i === currentIdx;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        done || current ? "bg-white/80" : "bg-white/[0.08]"
                      }`}
                    />
                  </React.Fragment>
                );
              })}
            </div>

            {/* Advance button */}
            {nextStatus ? (
              <Button
                onClick={() => advanceTo(nextStatus)}
                disabled={updatingStatus !== null}
                className="group w-full h-11 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 glow-white-soft disabled:opacity-60"
              >
                {updatingStatus === nextStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    Advance to {ORDER_STATUS_META[nextStatus].label}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-white/60">
                <Check className="h-4 w-4" />
                Order delivered. Nothing left to do.
              </div>
            )}

            {/* Quick-set to any later status (skip ahead) */}
            {!isDelivered && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-white/40 self-center mr-1">
                  Skip to:
                </span>
                {ORDER_STATUS_FLOW.slice(currentIdx + 2).map((s) => (
                  <button
                    key={s}
                    onClick={() => advanceTo(s)}
                    disabled={updatingStatus !== null}
                    className="px-2.5 py-1 rounded-full text-[11px] border border-white/10 text-white/55 hover:text-white hover:border-white/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {ORDER_STATUS_META[s].label}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ---------- BRIEF DETAILS ---------- */}
          <section className="p-6 border-b border-white/[0.06]">
            <p className="text-mono-label text-white/40 mb-4">Brief</p>
            <div className="space-y-4">
              <BriefRow icon={User} label="Client" value={order.client.name ?? order.client.email} />
              <BriefRow icon={Building2} label="Brand" value={order.brandName} />
              {order.industry && (
                <BriefRow icon={Building2} label="Industry" value={order.industry} />
              )}
              {brief?.objective && (
                <BriefRow
                  icon={Target}
                  label="Objective"
                  value={brief.objective.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                />
              )}
              {brief?.style && (
                <BriefRow icon={Palette} label="Style" value={brief.style.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} />
              )}
              {brief?.targetAudience && (
                <BriefRow icon={MessageSquare} label="Audience" value={brief.targetAudience} multiline />
              )}
              {brief?.keyMessage && (
                <BriefRow icon={MessageSquare} label="Key message" value={brief.keyMessage} multiline />
              )}
              {brief?.additionalNotes && (
                <BriefRow icon={MessageSquare} label="Notes" value={brief.additionalNotes} multiline />
              )}
              {brief?.referenceLinks?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-mono-label text-white/40">References</p>
                  <ul className="space-y-1.5">
                    {brief.referenceLinks.map((url: string, i: number) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white break-all"
                        >
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover:text-white" />
                          <span className="underline underline-offset-2 decoration-white/20">
                            {url}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <BriefRow
                icon={Calendar}
                label="Deadline"
                value={fmtDate(order.deadline)}
              />
              <BriefRow
                icon={Clock}
                label="Submitted"
                value={fmtDate(order.createdAt)}
              />
            </div>
          </section>

          {/* ---------- DELIVERY FILE ---------- */}
          <section className="p-6">
            <p className="text-mono-label text-white/40 mb-4">Delivery file</p>
            {order.deliveryFileUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
                    <FileVideo className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">
                      {order.deliveryFileName ?? "Final reel"}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {order.deliveryFileUrl}
                    </p>
                  </div>
                  <a
                    href={order.deliveryFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open
                  </a>
                </div>
                <UploadDropzone
                  orderId={order.id}
                  existingFileName={order.deliveryFileName}
                  onUploaded={onMutated}
                />
              </div>
            ) : (
              <UploadDropzone
                orderId={order.id}
                existingFileName={null}
                onUploaded={onMutated}
              />
            )}
          </section>
        </div>
      </motion.aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Brief row
// ---------------------------------------------------------------------------
function BriefRow({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex items-start gap-3 flex-1">
        <Icon className="h-3.5 w-3.5 text-white/35 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] tracking-wider uppercase text-white/40 mb-0.5">
            {label}
          </p>
          <p
            className={`text-sm text-white/85 ${
              multiline ? "leading-relaxed whitespace-pre-wrap" : "truncate"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// UploadDropzone — the premium drag-and-drop file uploader
// ===========================================================================
function UploadDropzone({
  orderId,
  existingFileName,
  onUploaded,
}: {
  orderId: string;
  existingFileName: string | null;
  onUploaded: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  async function handleFile(file: File) {
    // Validate client-side first
    const allowed = [".mp4", ".mov", ".webm", ".m4v"];
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Unsupported file type. Use MP4, MOV, or WebM.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large. Max 500MB.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use XHR for progress events — fetch doesn't support upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/orders/${orderId}/upload`);
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data?.error ?? "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.send(formData);
      });

      toast.success(
        existingFileName
          ? "Delivery file replaced."
          : "File attached. You can now mark the order as Delivered.",
      );
      onUploaded();
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be picked again after removal
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!uploading) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
        dragging
          ? "border-white/50 bg-white/[0.06] scale-[1.01]"
          : "border-white/[0.12] bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.03]"
      } ${uploading ? "pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v"
        onChange={onInputChange}
        className="hidden"
      />

      {/* Upload progress overlay */}
      {uploading ? (
        <div className="flex flex-col items-center gap-4 py-2">
          <Loader2 className="h-7 w-7 animate-spin text-white/70" />
          <div className="w-full max-w-[240px]">
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span>Uploading…</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <motion.div
                className="h-full bg-white/80"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={dragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-12 w-12 rounded-full border border-white/20 bg-white/[0.03] flex items-center justify-center"
          >
            <UploadCloud className="h-5 w-5 text-white/70" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-white/85">
              {dragging
                ? "Drop to upload"
                : existingFileName
                  ? "Replace delivery file"
                  : "Drop the final reel here"}
            </p>
            <p className="text-xs text-white/45 mt-1">
              or click to browse · MP4, MOV, WebM · up to 500MB
            </p>
          </div>
        </div>
      )}

      {/* Decorative grid while dragging */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
