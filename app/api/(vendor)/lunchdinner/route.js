import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/menu";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  try {
    await connectMongoDB();

    const lunchDinnerItems = await Menu.find({
      vendor: vendorId,
      category: "Menu",
    });

    console.log(lunchDinnerItems);

    return NextResponse.json({ lunchDinnerItems });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const { vendor, itemName, type, description, imageUrl, price } =
    await req.json();

  if (!vendor || !itemName || !type || !description || !imageUrl || !price) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  await connectMongoDB();

  // Create a new LunchDinner item
  const newLunchDinner = await Menu.create({
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    category: "Menu",
    isActive: true,
  });

  return Response.json({ lunchDinner: newLunchDinner }, { status: 201 });
}

export async function PATCH(req) {
  const { _id, isActive } = await req.json();

  if (!_id) {
    return Response.json({ message: "Item ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  // Update the status of the LunchDinner item
  const updatedLunchDinner = await Menu.findByIdAndUpdate(
    _id,
    { isActive },
    { new: true }
  );

  return Response.json({ lunchDinner: updatedLunchDinner });
}
