import { connectMongoDB } from "@/lib/mongodb";
import Orders from "@/models/orders";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  await connectMongoDB();

  const { orderId } = params; // Extract orderId from the dynamic route
  // console.log(orderId);
  try {
    const order = await Orders.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Update the order status to "Received"
    order.status = "Received";
    await order.save();

    return NextResponse.json(
      { message: "Order status updated to Received" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
