import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // Await params for nextjs dynamic routing
    const { id } = await Promise.resolve(params);

    const query = await prisma.resourceQuery.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(query);
  } catch (error) {
    console.error("Error updating query:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
