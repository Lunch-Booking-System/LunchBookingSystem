import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/menu";
import Vendor from "@/models/vendor"; // Ensure the path is correct

export async function GET(req) {
  try {
    await connectMongoDB();

    const menuItems = await Menu.find({}).populate("vendor").lean();

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json(
        { error: "No menu items found" },
        { status: 404 }
      );
    }

    const updatedMenuItems = menuItems.map((item) => ({
      ...item,
      category: "Menu",
    }));

    return NextResponse.json(
      { success: true, menuItems: updatedMenuItems },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
