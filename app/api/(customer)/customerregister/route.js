import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { firstName, lastName, email, password,company,address } = await req.json();

   
    if (!firstName || !lastName || !email || !password|| !company|| !address) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

  
    await connectMongoDB();


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use." },
        { status: 409 } // 409 Conflict
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await User.create({ firstName, lastName, email, password: hashedPassword,address,company });

    return NextResponse.json(
      { message: "User registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}
