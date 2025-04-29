import { connectMongoDB } from "@/lib/mongodb";
import Snack from "@/models/snacks";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return Response.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  const snacks = await Snack.find({
    vendor: vendorId,
    category: "AllDaySnacks",
  });
  return Response.json({ snacks });
}

export async function POST(req) {
  const { vendor, itemName, type, description, imageUrl, price, available } =
    await req.json();

  if (!vendor || !itemName || !type || !description || !imageUrl || !price) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  await connectMongoDB();

  const newSnack = await Snack.create({
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    category: "AllDaySnacks",
    available: true,
  });

  return Response.json({ snack: newSnack }, { status: 201 });
}

export async function PATCH(req) {
  try {
    const { _id, available } = await req.json();

    if (!_id) {
      return Response.json({ message: "Snack ID missing" }, { status: 400 });
    }

    await connectMongoDB();

    // Update the snack with the new available status
    const updatedSnack = await Snack.findByIdAndUpdate(
      _id,
      { available },
      { new: true } // Ensures the updated document is returned
    );

    if (!updatedSnack) {
      return Response.json({ message: "Snack not found" }, { status: 404 });
    }

    return Response.json({ snack: updatedSnack }, { status: 200 });
  } catch (error) {
    console.error("Error updating snack:", error);
    return Response.json({ message: "Error updating snack" }, { status: 500 });
  }
}
