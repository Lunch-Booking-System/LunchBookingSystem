import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Snack from "@/models/snacks"; 

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const snackId = searchParams.get("id"); 

  if (!snackId) {
    return NextResponse.json(
      { message: "Snack ID is required" },
      { status: 400 }
    );
  }

  await connectMongoDB();

  try {
    const snack = await Snack.findById(snackId).lean();

    if (!snack) {
      return NextResponse.json({ message: "Snack not found" }, { status: 404 });
    }

    return NextResponse.json(snack, { status: 200 });
  } catch (error) {
    console.error("Error fetching snack by ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
