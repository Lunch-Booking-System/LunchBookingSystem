import { connectMongoDB } from "../../../lib/mongodb";
import Vendor from "../../../models/vendor";  // Assuming Vendor model is defined
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    
    const { email, password, verifiedId } = await req.json();

    if (!email || !password || !verifiedId) {
      return NextResponse.json(
        { message: "Email, password, and verifiedId are required." },
        { status: 400 }
      );
    }

    await connectMongoDB();

   
    const vendor = await Vendor.findOne({ email, _id: verifiedId }).select("_id email password name");
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found." },
        { status: 404 }
      );
    }

    
    const isPasswordMatched = await bcrypt.compare(password, vendor.password);

    if (!isPasswordMatched) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      vendor: {
        id: vendor._id,
        email: vendor.email,
        name: vendor.name, 
      },
    });

  } catch (error) {
    console.error("Error retrieving vendor:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the vendor." },
      { status: 500 }
    );
  }
}
