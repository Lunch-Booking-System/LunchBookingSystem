import { connectMongoDB } from "../../../lib/mongodb";
import Vendor from "../../../models/vendor";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, phone, email, password, shopName, address } = await req.json();

    // Check if all required fields are provided
    if (!name || !phone || !email || !password || !shopName || !address) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Check if the email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json(
        { message: "Email is already in use." },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new vendor with the hashed password and other details
    await Vendor.create({
      name,
      phone,
      email,
      shopName,
      address,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Vendor registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the vendor." },
      { status: 500 }
    );
  }
}
