import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const banners = await prisma.heroBanner.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(banners);
}
