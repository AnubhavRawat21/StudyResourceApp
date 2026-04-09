import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        downloads: {
          include: {
            resource: true
          }
        },
        resources: true 
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Don't send the hashed password to the client!
    const { hashed_password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error(error, "USER_PROFILE_GET_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Missing Fields", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    });

    const { hashed_password, ...safeUser } = updatedUser;

    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error(error, "USER_PROFILE_PATCH_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
