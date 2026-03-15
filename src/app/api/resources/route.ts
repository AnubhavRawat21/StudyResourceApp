import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

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
    const resources = await prisma.resource.findMany({
      include: {
        category: true,
        uploaded_by: {
          select: { name: true, email: true },
        },
      },
      orderBy: { upload_date: "desc" },
    });
    return NextResponse.json(resources);
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

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!title || !categoryId || !file) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validation Phase 4
    const validExtensions = [".pdf", ".docx", ".pptx"];
    const ext = path.extname(file.name).toLowerCase();
    if (!validExtensions.includes(ext)) {
      return new NextResponse("Invalid file type (PDF, DOCX, PPTX only).", { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return new NextResponse("File size exceeds 10MB limit.", { status: 400 });
    }

    // Save File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Unique filename
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, uniqueName);
    await writeFile(filepath, buffer);

    const relativePath = `/uploads/${uniqueName}`;

    // Database Record
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        categoryId,
        file_path: relativePath,
        // @ts-ignore
        userId: session.user.id,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Upload Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
