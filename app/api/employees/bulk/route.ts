import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
}

function verifyToken(request: NextRequest): JwtPayload | null {
  const token = request.cookies.get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of employees" },
        { status: 400 }
      );
    }

    const result = await db.collection("employees").insertMany(body);

    return NextResponse.json({
      success: true,
      inserted: result.insertedCount,
      data: result.insertedIds,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}