import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";

const libsql = createClient({
  url: "file:./dev.db",
});
// @ts-ignore
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const categoryId = searchParams.get("category") || "";

    const resources = await prisma.resource.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                ],
              }
            : {},
          categoryId ? { categoryId } : {},
        ],
      },
      include: {
        category: true,
        uploaded_by: {
          select: { name: true },
        },
      },
      orderBy: { upload_date: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
