import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Orders from "@/models/orders";
import User from "@/models/user";
import Menu from "@/models/menu";
import Vendor from "@/models/vendor";

export async function GET(req) {
  const orderId = req.nextUrl.searchParams.get("orderId"); // Get from query string
  console.log("orderId", orderId);

  if (!orderId) {
    return NextResponse.json(
      { message: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    // console.log("DB Connected");

    const order = await Orders.findById(orderId)
      .populate({
        path: "customer",
        model: User,
        select: "firstName lastName empId company",
      })
      .populate({
        path: "items.itemId",
        select: "itemName price imageUrl",
      })
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
