import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Vendor from "@/models/vendor";

export async function GET() {
  try {
    await connectMongoDB();

    // Fetch all vendors
    const vendors = await Vendor.find({}).lean();

    // Remove sensitive data from each vendor
    const sanitizedVendors = vendors.map(({ password, ...rest }) => rest);

    return NextResponse.json({ vendors: sanitizedVendors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
