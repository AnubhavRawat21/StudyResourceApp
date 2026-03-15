import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";

const libsql = createClient({
  url: "file:./dev.db",
});
// @ts-ignore
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }

    const _role = role === "ADMIN" ? "ADMIN" : "STUDENT";

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashed_password: hashedPassword,
        role: _role,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error(error, "REGISTRATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
