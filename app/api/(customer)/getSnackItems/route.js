import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Snacks from "@/models/snacks";

export async function GET() {
  await connectMongoDB();

  try {
    const snackItems = await Snacks.find({
      category: "AllDaySnacks",
      available: true,
    }).lean();

    if (!snackItems.length) {
      return NextResponse.json(
        { message: "No snack items found" },
        { status: 404 }
      );
    }

    return NextResponse.json(snackItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching snack menu:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
