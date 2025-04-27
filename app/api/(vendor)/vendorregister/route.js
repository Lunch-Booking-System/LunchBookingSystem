import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user"; // Make sure you're importing User model

export async function POST(req) {
  try {
    console.log("Received request for user registration.");

    const body = await req.json().catch((err) => {
      console.error("Error parsing request JSON:", err);
      return null;
    });

    if (!body) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      empId,
      email,
      phoneNo,
      address,
      company,
      password,
    } = body;

    await connectMongoDB();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      empId,
      email,
      phoneNo,
      address,
      company,
      password: hashedPassword,
    });

    await newUser.save();

    console.log("User registered successfully:", newUser);

    return NextResponse.json(
      { message: "User registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while registering user:", error);
    return NextResponse.json(
      {
        message: "An error occurred while registering the user.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
