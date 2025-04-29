import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/snacks"; // Assuming same model for breakfast items

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return Response.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  const breakfasts = await Menu.find({
    vendor: vendorId,
    category: "BreakFast", 
  });

  return Response.json({ breakfasts });
}

export async function POST(req) {
  const { vendor, itemName, type, description, imageUrl, price, available } =
    await req.json();

  if (!vendor || !itemName || !type || !description || !imageUrl || !price) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  await connectMongoDB();

  const newBreakfast = await Menu.create({
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    category: "BreakFast", 
    available: true, 
  });

  return Response.json({ breakfast: newBreakfast }, { status: 201 });
}

export async function PATCH(req) {
  try {
    const { _id, available } = await req.json();
    console.log("PATCH request received:", { _id, available });

    if (!_id) {
      return Response.json(
        { message: "Breakfast ID missing" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const updatedBreakfast = await Menu.findByIdAndUpdate(
      _id,
      { available },
      { new: true }
    );

    if (!updatedBreakfast) {
      return Response.json(
        { message: "Breakfast item not found" },
        { status: 404 }
      );
    }

    console.log("Updated Breakfast:", updatedBreakfast);

    return Response.json({ breakfast: updatedBreakfast }, { status: 200 });
  } catch (error) {
    console.error("Error updating breakfast:", error);
    return Response.json(
      { message: "Error updating breakfast" },
      { status: 500 }
    );
  }
}
