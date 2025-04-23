// pages/api/updateBreakfasts.js
import { connectMongoDB } from "@/lib/mongodb";
import Snack from "@/models/snacks";
import { NextResponse } from "next/server";

connectMongoDB();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { _id, itemName, description, category, type, price, imageUrl } =
      body;

    if (!_id) {
      return NextResponse.json(
        { error: "Breakfast ID is required" },
        { status: 400 }
      );
    }

    const updatedBreakfast = await Snack.findByIdAndUpdate(
      _id,
      {
        itemName,
        description,
        category,
        type,
        price,
        imageUrl,
      },
      { new: true }
    );

    if (!updatedBreakfast) {
      return NextResponse.json(
        { error: "Breakfast not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, breakfast: updatedBreakfast });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update breakfast", details: error.message },
      { status: 500 }
    );
  }
}
