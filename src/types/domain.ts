/**
 * Reelzak — Shared Domain Types
 * Mirrors the Prisma models so client + server code share one vocabulary.
 */

export type Role = "CLIENT" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "IDEATION"
  | "AI_GENERATION"
  | "EDITING"
  | "READY_FOR_REVIEW"
  | "DELIVERED";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  brandName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BriefDetails {
  objective: "AWARENESS" | "SALES" | "EDUCATIONAL";
  style: ("CINEMATIC" | "3D" | "REALISTIC" | "ANIMATED" | "MINIMAL")[number] | string;
  targetAudience: string;
  keyMessage: string;
  referenceLinks?: string[];
  additionalNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  brandName: string;
  industry?: string | null;
  briefDetails: string; // JSON-encoded BriefDetails
  status: OrderStatus;
  deadline: string | null;
  deliveryFileUrl?: string | null;
  deliveryFileName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  priceUsd: number;
  reelCount: number;
  cadence: "one-time" | "monthly";
  popular: boolean;
  features: string[]; // parsed from JSON
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// UI helpers
// --------------------------------------------------------------------------

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    description: "Brief submitted — our team is reviewing it.",
  },
  IDEATION: {
    label: "Ideation",
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    description: "Our creative team is crafting concept directions.",
  },
  AI_GENERATION: {
    label: "AI Generation",
    color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    description: "Generating visual assets with our AI pipeline.",
  },
  EDITING: {
    label: "Editing",
    color: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    description: "Assembling, color-grading, and sound-designing your reel.",
  },
  READY_FOR_REVIEW: {
    label: "Ready for Review",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    description: "First cut delivered — review and share feedback.",
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-500/15 text-green-300 border-green-500/30",
    description: "Final reel delivered. Ready to download.",
  },
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "IDEATION",
  "AI_GENERATION",
  "EDITING",
  "READY_FOR_REVIEW",
  "DELIVERED",
];
