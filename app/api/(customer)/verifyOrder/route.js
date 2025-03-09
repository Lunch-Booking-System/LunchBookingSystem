import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Orders from "@/models/orders";
import { connectMongoDB } from "@/lib/mongodb";

const generatedSignature = (razorpayOrderId, razorpayPaymentId) => {
  const keySecret = process.env.RAZORPAY_SECRET_ID;

  const sig = crypto
    .createHmac("sha256", keySecret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");
  return sig;
};

export async function POST(request) {
  const { orderId, razorpayorderId, razorpayPaymentId, razorpaySignature } =
    await request.json();

  const signature = generatedSignature(razorpayorderId, razorpayPaymentId);
  if (signature !== razorpaySignature) {
    return NextResponse.json(
      { message: "payment verification failed", isOk: false },
      { status: 400 }
    );
  }

  await connectMongoDB();

  // Update order's payment status
  const updatedOrder = await Orders.findByIdAndUpdate(
    orderId,
    { paymentStatus: "Paid" },
    { new: true }
  );

  if (!updatedOrder) {
    return NextResponse.json(
      { message: "Order not found", isOk: false },
      { status: 404 }
    );
  }
  return NextResponse.json(
    {
      message: "Payment verified successfully",
      isOk: true,
      order: updatedOrder,
    },
    { status: 200 }
  );
}
