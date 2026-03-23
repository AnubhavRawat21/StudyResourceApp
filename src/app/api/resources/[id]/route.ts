import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await Promise.resolve(params);

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        category: true,
        uploaded_by: { select: { name: true, email: true } },
      },
    });

    if (!resource) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(resource);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await Promise.resolve(params);

    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Attempt to delete file from local storage
    try {
      if (resource.file_path) {
        const fullPath = path.join(process.cwd(), "public", resource.file_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    } catch (fsError) {
      console.error("Failed to delete local file:", fsError);
      // We will still delete the db record even if file deletion fails
    }

    await prisma.resource.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
