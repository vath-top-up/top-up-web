import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const faqs = await prisma.faq.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(faqs);
}
