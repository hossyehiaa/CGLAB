import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/types/domain";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isAdmin(user: { role: string } | null): boolean {
  return !!user && user.role === "ADMIN";
}

const VALID_STATUSES = new Set<OrderStatus>(ORDER_STATUS_FLOW);

// ---------------------------------------------------------------------------
// PATCH /api/orders/[id] — update an order's status (and optionally attach a
// delivery file). Admin-only.
// ---------------------------------------------------------------------------
const PatchSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "IDEATION",
      "AI_GENERATION",
      "EDITING",
      "READY_FOR_REVIEW",
      "DELIVERED",
    ])
    .optional(),
  deliveryFileUrl: z.string().url().optional(),
  deliveryFileName: z.string().max(255).optional(),
  note: z.string().max(1000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { status, deliveryFileUrl, deliveryFileName, note } = parsed.data;

  // Validate the status transition is allowed (must move forward in the flow,
  // OR stay the same — we don't allow backward moves to keep the audit trail
  // honest).
  if (status && !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (status) {
    const fromIdx = ORDER_STATUS_FLOW.indexOf(existing.status);
    const toIdx = ORDER_STATUS_FLOW.indexOf(status);
    if (toIdx < fromIdx) {
      return NextResponse.json(
        {
          error: "Status cannot move backward through the pipeline.",
        },
        { status: 400 },
      );
    }
  }

  // If marking DELIVERED, require a delivery file URL.
  if (status === "DELIVERED" && !deliveryFileUrl && !existing.deliveryFileUrl) {
    return NextResponse.json(
      { error: "Attach a delivery file before marking as Delivered." },
      { status: 400 },
    );
  }

  // Build the update payload
  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (deliveryFileUrl !== undefined) update.deliveryFileUrl = deliveryFileUrl;
  if (deliveryFileName !== undefined)
    update.deliveryFileName = deliveryFileName;

  const updated = await db.order.update({
    where: { id },
    data: update,
  });

  // Write an audit row if the status actually changed
  if (status && status !== existing.status) {
    await db.orderStatusUpdate.create({
      data: {
        orderId: id,
        fromStatus: existing.status,
        toStatus: status,
        changedById: user!.id,
        note: note ?? null,
      },
    });
  }

  return NextResponse.json({ order: updated });
}

// ---------------------------------------------------------------------------
// GET /api/orders/[id] — fetch a single order with its status history.
// Used by the admin order detail drawer.
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, name: true, email: true, brandName: true },
      },
      statusUpdates: {
        orderBy: { createdAt: "asc" },
        include: {
          changedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
