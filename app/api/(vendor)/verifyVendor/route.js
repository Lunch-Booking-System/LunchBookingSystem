import { connectMongoDB } from "@/lib/mongodb";
import Vendor from "@/models/vendor";
import { NextResponse } from "next/server";



export async function POST(req) {
  try {
    await connectMongoDB();
    const { verifiedId } = await req.json();
    console.log(verifiedId)
    const vendor = await Vendor.findOne({ 
      _id: verifiedId 
    });

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
    
  } catch (error) {
    console.error("Error retrieving vendor:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the vendor." }, 
      { status: 500 }
    );
  }
}
