import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// POST /api/orders/[id]/upload
// Admin-only. Accepts a multipart/form-data upload with a single `file` field.
// Stores the file via:
//   1. Vercel Blob (production — when BLOB_READ_WRITE_TOKEN is set), OR
//   2. Local filesystem under /public/uploads (sandbox / no-blob fallback).
// Attaches the resulting URL + filename to the order record and returns them.
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500MB cap
const ALLOWED_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "application/octet-stream", // some clients send this for mp4 — accept and verify by extension
]);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const order = await db.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Attach a `file` field." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Max 500MB." },
      { status: 413 },
    );
  }

  // Validate mime / extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = new Set([".mp4", ".mov", ".webm", ".m4v"]);
  if (!ALLOWED_MIMES.has(file.type) && !allowedExts.has(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use MP4, MOV, or WebM." },
      { status: 415 },
    );
  }

  // -----------------------------------------------------------------------
  // Storage backend selection
  // -----------------------------------------------------------------------
  let url: string;
  let storedName: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // ---- Vercel Blob (production) ----
    const { put } = await import("@vercel/blob");
    const blob = await put(
      `reelzak/${order.orderNumber}/${file.name}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
      },
    );
    url = blob.url;
    storedName = file.name;
  } else {
    // ---- Local filesystem fallback (sandbox / no-blob dev) ----
    const uploadsDir = path.join(process.cwd(), "public", "uploads", order.orderNumber);
    await mkdir(uploadsDir, { recursive: true });
    const unique = `${randomUUID()}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, unique), buf);
    url = `/uploads/${order.orderNumber}/${unique}`;
    storedName = file.name;
  }

  // Attach to the order
  const updated = await db.order.update({
    where: { id },
    data: {
      deliveryFileUrl: url,
      deliveryFileName: file.name,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      order: { id: updated.id, orderNumber: updated.orderNumber },
      file: { url, name: storedName, size: file.size, type: file.type || ext },
    },
    { status: 201 },
  );
}
