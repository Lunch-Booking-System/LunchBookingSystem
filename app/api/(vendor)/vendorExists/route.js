import { connectMongoDB } from "@/lib/mongodb";
import Vendor from "@/models/vendor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectMongoDB();
    
    const { email, password, verifiedId } = await req.json();

    // Validate verifiedId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(verifiedId)) {
      return NextResponse.json({ message: "Invalid vendor ID." }, { status: 400 });
    }

    // Find vendor by email and _id
    const vendor = await Vendor.findOne({ 
      email,
      _id: verifiedId,  // Ensuring that we match the correct vendor
    });

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }


    return NextResponse.json({ vendor });
    
  } catch (error) {
    console.error("Error retrieving vendor:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the vendor.", error: error.message }, 
      { status: 500 }
    );
  }
}
