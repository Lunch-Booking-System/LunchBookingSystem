import { connectMongoDB } from "@/lib/mongodb";
import Vendor from "@/models/vendor";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongoDB();

    // Get vendorId from the URL
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    const mealType = req.nextUrl.searchParams.get("mealType") || 'all';

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ message: "Invalid vendor ID" }, { status: 400 });
    }

    const vendor = await Vendor.findById(vendorId).populate("menuItems");
    
    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }

    // Filter menu items by meal type if specified
    let menuItems = vendor.menuItems || [];
    if (mealType !== 'all') {
      menuItems = menuItems.filter(item => item.type === mealType);
    }

    return NextResponse.json(menuItems);

  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching menu items", error: error.message },
      { status: 500 }
    );
  }
}
