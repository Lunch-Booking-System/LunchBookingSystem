import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Orders from "@/models/orders";

export async function POST(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { customer, vendor, items, totalAmount, orderDate } = body;

    if (
      !customer ||
      !vendor ||
      !items ||
      !totalAmount ||
      !orderDate ||
      !orderDate.time
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newOrder = await Orders.create({
      customer,
      vendor,
      items,
      totalAmount,
      orderDate,
    });

    return NextResponse.json(
      { message: "Order created successfully", order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
