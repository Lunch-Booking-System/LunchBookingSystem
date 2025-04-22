import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/snacks"; // Ensure this is pointing to the correct schema file

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return Response.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  const lunchDinnerItems = await Menu.find({
    vendor: vendorId,
  });

  return Response.json({ lunchDinnerItems });
}

export async function POST(req) {
  const {
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    menuDate, // expects { date, dayName, month, year }
  } = await req.json();

  if (
    !vendor ||
    !itemName ||
    !type ||
    !description ||
    !imageUrl ||
    !price ||
    !menuDate?.date ||
    !menuDate?.dayName ||
    !menuDate?.month ||
    !menuDate?.year
  ) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  await connectMongoDB();

  const newItem = await Menu.create({
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    menuDate,
  });

  return Response.json({ lunchDinnerItem: newItem }, { status: 201 });
}

export async function PATCH(req) {
  const { _id, ...updateData } = await req.json();

  if (!_id) {
    return Response.json({ message: "Item ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  const updatedItem = await Menu.findByIdAndUpdate(
    _id,
    updateData,
    { new: true }
  );

  return Response.json({ lunchDinnerItem: updatedItem });
}
