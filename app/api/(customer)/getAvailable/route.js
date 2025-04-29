import { connectMongoDB } from "@/lib/mongodb";
import Snack from "@/models/snacks";
import Menu from "@/models/menu";

// GET route for fetching available snacks
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");
  const type = searchParams.get("type"); // Can be used to differentiate between Snack and Menu routes

  if (!vendorId) {
    return Response.json({ message: "Vendor ID missing" }, { status: 400 });
  }

  await connectMongoDB();

  if (type === "snacks") {
    // Fetch only available snacks
    const snacks = await Snack.find({
      vendor: vendorId,
      available: true,
    });
    return Response.json({ snacks });
  }

  if (type === "menu") {
    // Fetch only available menu items
    const menuItems = await Menu.find({
      vendor: vendorId,
      available: true,  // Assuming you've added this field to the Menu schema
    });
    return Response.json({ menu: menuItems });
  }

  return Response.json({ message: "Invalid type specified" }, { status: 400 });
}

// POST route for creating a new snack
export async function POST(req) {
  const { vendor, itemName, type, description, imageUrl, price } = await req.json();

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

// PATCH route for updating snack or menu availability
export async function PATCH(req) {
  try {
    const { _id, available, type } = await req.json(); // Get 'type' to determine if it's a snack or menu

    if (!_id) {
      return Response.json({ message: "ID missing" }, { status: 400 });
    }

    await connectMongoDB();

    if (type === "snack") {
      const updatedSnack = await Snack.findByIdAndUpdate(_id, { available }, { new: true });
      if (!updatedSnack) {
        return Response.json({ message: "Snack not found" }, { status: 404 });
      }
      return Response.json({ snack: updatedSnack });
    }

    if (type === "menu") {
      const updatedMenu = await Menu.findByIdAndUpdate(_id, { available }, { new: true });
      if (!updatedMenu) {
        return Response.json({ message: "Menu item not found" }, { status: 404 });
      }
      return Response.json({ menu: updatedMenu });
    }

    return Response.json({ message: "Invalid type specified" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Error updating item" }, { status: 500 });
  }
}
