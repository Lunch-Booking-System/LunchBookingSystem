import { connectMongoDB } from "@/lib/mongodb";
import Snack from "@/models/snacks";
import { NextResponse } from "next/server";

connectMongoDB();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { _id, itemName, description, type, price, imageUrl } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Snack ID is required" },
        { status: 400 }
      );
    }

    const updatedSnack = await Snack.findByIdAndUpdate(
      _id,
      {
        itemName,
        description,
        type,
        price,
        imageUrl,
      },
      { new: true }
    );

    if (!updatedSnack) {
      return NextResponse.json({ error: "Snack not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, snack: updatedSnack });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update snack", details: error.message },
      { status: 500 }
    );
  }
}
