import Orders from "@/models/orders";
import { NextResponse } from "next/server";
import Snacks from "@/models/snacks";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";
// import Menu from "@/models/menu";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);


    const vendorId = searchParams.get("vendorId");
    const selectedDate = searchParams.get("selectedDate");


    if (!vendorId || !selectedDate) {
      return NextResponse.json(
        { message: "Vendor ID and selectedDate are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Create start and end of the selected date for filtering
    const selectedDateObj = new Date(selectedDate);
    // console.log("Parsed date:", selectedDateObj);

    const startOfDay = new Date(selectedDateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // console.log("Date range:", { startOfDay, endOfDay });

    // Fetch paid orders for the vendor on the selected date
    const orders = await Orders.find({
      vendor: vendorId,
      paymentStatus: "Paid",
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    })
      .populate("customer")
      .populate({
        path: "items.itemId",
        select: "itemName type price imageUrl",
      });

    // console.log("Found orders:", orders.length);

    
    const summary = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const itemType = item.itemId?.type || "unknown";
        if (!acc[itemType]) {
          acc[itemType] = {
            count: 0,
            total: 0,
          };
        }
        acc[itemType].count += item.quantity;
        acc[itemType].total += (item.itemId?.price || 0) * item.quantity;
      });
      return acc;
    }, {});

    // Calculate total amount
    const totalAmount = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) =>
            itemSum + (item.itemId?.price || 0) * item.quantity,
          0
        ),
      0
    );

    return NextResponse.json({
      orders,
      summary,
      totalOrders: orders.length,
      totalAmount,
    });
  } catch (error) {
    console.error("Error fetching paid orders:", error);
    return NextResponse.json(
      { message: "Error fetching paid orders", error: error.message },
      { status: 500 }
    );
  }
}