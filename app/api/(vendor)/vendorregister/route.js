import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import Vendor from "@/models/vendor";

export async function POST(req) {
  try {
    console.log("Received request for vendor registration.");

    const body = await req.json().catch((err) => {
      console.error("Error parsing request JSON:", err);
      return null;
    });

    if (!body) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { name, phone, email, password, shopName, address } = body;

    await connectMongoDB();

    // Check if the vendor already exists (to prevent duplicate emails)
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ message: "Vendor with this email already exists." }, { status: 400 });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new vendor
    const newVendor = new Vendor({
      name,
      phone,
      email,
      shopName,
      address,
      password: hashedPassword,
    });

    await newVendor.save();

    console.log("Vendor registered successfully:", newVendor);

    return NextResponse.json({ message: "Vendor registered successfully." }, { status: 201 });

  } catch (error) {
    console.error("Error while registering vendor:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the vendor.", error: error.message },
      { status: 500 }
    );
  }
}
