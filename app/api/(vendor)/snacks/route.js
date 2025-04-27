import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/snacks";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return Response.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  const snacks = await Menu.find({
    vendor: vendorId,
    category: "AllDaySnacks",
  });
  return Response.json({ snacks });
}

export async function POST(req) {
  const { vendor, itemName, type, description, imageUrl, price } =
    await req.json();

  if (!vendor || !itemName || !type || !description || !imageUrl || !price) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  await connectMongoDB();

  const newSnack = await Menu.create({
    vendor,
    itemName,
    type,
    description,
    imageUrl,
    price,
    category: "AllDaySnacks",
    isActive: true, 
  });

  return Response.json({ snack: newSnack }, { status: 201 });
}

export async function PATCH(req) {
  const { _id, isActive } = await req.json();

  if (!_id) {
    return Response.json({ message: "Snack ID missing" }, { status: 400 });
  }
  console.log(_id);

  await connectMongoDB();

  const updatedSnack = await Menu.findByIdAndUpdate(
    _id,
    { isActive },
    { new: true }
  );

  return Response.json({ snack: updatedSnack });
}
