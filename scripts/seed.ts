/**
 * Reelzak — Database Seed
 * Run with: bun run db:seed
 *
 * Creates:
 *   - 1 admin user (admin@reelzak.studio / reelzak-admin-2026)
 *   - 1 demo client user (client@reelzak.studio / reelzak-client-2026)
 *   - 3 sample orders for the demo client (one per status stage)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("→ Seeding Reelzak database…\n");

  // -----------------------------------------------------------------------
  // USERS
  // -----------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("reelzak-admin-2026", 12);
  const clientPassword = await bcrypt.hash("reelzak-client-2026", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@reelzak.studio" },
    update: {},
    create: {
      email: "admin@reelzak.studio",
      name: "Reelzak Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin:   ${admin.email}`);

  const client = await db.user.upsert({
    where: { email: "client@reelzak.studio" },
    update: {},
    create: {
      email: "client@reelzak.studio",
      name: "Mira Castellano",
      password: clientPassword,
      role: "CLIENT",
      brandName: "Castellano Atelier",
    },
  });
  console.log(`  ✓ Client:  ${client.email}\n`);

  // -----------------------------------------------------------------------
  // ORDERS — only seed if the client has none yet
  // -----------------------------------------------------------------------
  const existingOrders = await db.order.count({
    where: { clientId: client.id },
  });

  if (existingOrders > 0) {
    console.log(`  ↻ Client already has ${existingOrders} orders — skipping order seed.\n`);
    return;
  }

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const orders = [
    {
      orderNumber: "RZK-2026-0001",
      brandName: "Castellano Atelier",
      industry: "Fashion / Luxury",
      briefDetails: JSON.stringify({
        objective: "AWARENESS",
        style: "CINEMATIC",
        targetAudience: "Affluent women 28-45, urban professionals",
        keyMessage: "Slow luxury — every stitch tells a story",
        referenceLinks: ["https://instagram.com/reel.castellano"],
        additionalNotes: "Use warm grain, no dialogue, score-driven edit.",
      }),
      status: "EDITING",
      deadline: inDays(3),
    },
    {
      orderNumber: "RZK-2026-0002",
      brandName: "Castellano Atelier",
      industry: "Fashion / Luxury",
      briefDetails: JSON.stringify({
        objective: "SALES",
        style: "REALISTIC",
        targetAudience: "Existing customers + warm leads",
        keyMessage: "Pre-fall collection — 48-hour early access",
        referenceLinks: [],
        additionalNotes: "End with product close-up + CTA card.",
      }),
      status: "IDEATION",
      deadline: inDays(8),
    },
    {
      orderNumber: "RZK-2026-0003",
      brandName: "Castellano Atelier",
      industry: "Fashion / Luxury",
      briefDetails: JSON.stringify({
        objective: "EDUCATIONAL",
        style: "MINIMAL",
        targetAudience: "New followers unfamiliar with the brand",
        keyMessage: "How our atelier builds a single garment in 14 days",
        referenceLinks: [],
        additionalNotes: "VO + b-roll. 45-second vertical cut.",
      }),
      status: "DELIVERED",
      deadline: inDays(-2),
      deliveryFileUrl: "https://example.com/reels/rzk-2026-0003-final.mp4",
      deliveryFileName: "RZK-2026-0003-castellano-process-reel.mp4",
    },
  ];

  for (const o of orders) {
    const created = await db.order.create({
      data: { ...o, clientId: client.id },
    });
    console.log(`  ✓ Order:   ${created.orderNumber}  [${created.status}]`);
  }

  console.log("\n→ Seed complete.\n");
  console.log("  ──────────────────────────────────────────────");
  console.log("  Admin login:");
  console.log("    email:    admin@reelzak.studio");
  console.log("    password: reelzak-admin-2026");
  console.log("");
  console.log("  Client login:");
  console.log("    email:    client@reelzak.studio");
  console.log("    password: reelzak-client-2026");
  console.log("  ──────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
