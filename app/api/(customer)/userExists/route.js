import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectMongoDB();

    // Find the user by email
    const user = await User.findOne({ email }).select(
      "_id password firstName lastName"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Compare passwords
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Return user data on success
    return NextResponse.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "An error occurred during login." },
      { status: 500 }
    );
  }
}
