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

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
