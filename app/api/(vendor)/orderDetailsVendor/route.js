import { NextResponse } from "next/server";
import mongoose from "mongoose"; // ✅ Import Mongoose
import Orders from "@/models/orders";
import User from "@/models/user";
import Menu from "@/models/menu";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const day = parseInt(searchParams.get("day"));
    const month = searchParams.get("month"); // Keep as string if stored as "02"
    const year = parseInt(searchParams.get("year"));

    console.log("Vendor ID:", vendorId);
    console.log("Day:", day);
    console.log("Month:", month);
    console.log("Year:", year);

    if (!vendorId || !day || !month || !year) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const orders = await Orders.find({
      "orderDate.date": day,
      "orderDate.month": month,
      "orderDate.year": year,
      vendor: new mongoose.Types.ObjectId(vendorId), // ✅ Convert to ObjectId
      status: "paid",
    })
      .populate({
        path: "customer",
        model: User,
        select: "firstName lastName empId company",
      })
      .populate({
        path: "items.itemId",
        model: Menu,
        select: "itemName",
      })
      .lean();

    if (!orders.length) {
      return NextResponse.json(
        { message: "No orders found for selected date or Invalid Vendor-Id" },
        { status: 404 }
      );
    }
    console.log("Orders:", orders);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
