import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/snacks"; // Assuming a 'breakfast' model exists, similar to 'snacks'

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return Response.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  // Fetch breakfast items for the given vendor
  const breakfasts = await Menu.find({
    vendor: vendorId,
    category: "BreakFast", // Changed category to 'Breakfast'
  });

  return Response.json({ breakfasts });
}

export async function POST(req) {
  const { vendor, itemName, type, description, imageUrl, price } =
    await req.json();

  if (!vendor || !itemName || !type || !description || !imageUrl || !price) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  await connectMongoDB();

  // Create a new breakfast item
  const newBreakfast = await Menu.create({
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    category: "Breakfast", // Category set to 'Breakfast'
    isActive: true, // Default status is true (active)
  });

  return Response.json({ breakfast: newBreakfast }, { status: 201 });
}

export async function PATCH(req) {
  const { _id, isActive } = await req.json();

  if (!_id) {
    return Response.json({ message: "Breakfast ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  // Update the status of the breakfast item
  const updatedBreakfast = await Menu.findByIdAndUpdate(
    _id,
    { isActive },
    { new: true }
  );

  return Response.json({ breakfast: updatedBreakfast });
}
