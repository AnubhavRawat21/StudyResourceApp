import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const role = session.user.role;

    let queries;

    if (role === "ADMIN") {
      // Admins see all queries
      queries = await prisma.resourceQuery.findMany({
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Students see only their own queries
      // @ts-ignore
      const userId = session.user.id;
      queries = await prisma.resourceQuery.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(queries);
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, description } = await req.json();

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    // @ts-ignore
    const userId = session.user.id;

    const query = await prisma.resourceQuery.create({
      data: {
        subject,
        description,
        userId,
      },
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error("Error creating query:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
