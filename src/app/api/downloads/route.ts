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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { resourceId } = body;

    // Optional: prevent duplicate download logs for the exact same resource if preferred
    // For this example, we just track every download.
    const download = await prisma.download.create({
      data: {
        resourceId,
        // @ts-ignore
        userId: session.user.id,
      },
    });

    return NextResponse.json(download);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const history = await prisma.download.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id,
      },
      include: {
        resource: {
          include: { category: true },
        },
      },
      orderBy: { download_date: "desc" },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
