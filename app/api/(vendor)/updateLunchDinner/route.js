// app/api/updateLunchDinner/route.js
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/menu"; // Assuming 'Menu' is your LunchDinner schema
import { NextResponse } from "next/server";

connectMongoDB();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { _id, itemName, description, type, price, imageUrl } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "LunchDinner ID is required" },
        { status: 400 }
      );
    }

    const updatedLunchDinner = await Menu.findByIdAndUpdate(
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

    if (!updatedLunchDinner) {
      return NextResponse.json(
        { error: "LunchDinner item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lunchDinner: updatedLunchDinner });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update LunchDinner item", details: error.message },
      { status: 500 }
    );
  }
}
