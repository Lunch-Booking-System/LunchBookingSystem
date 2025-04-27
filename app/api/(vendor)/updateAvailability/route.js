import { connectMongoDB } from "@/lib/mongodb";
import Snacks from "@/models/snack";

export async function POST(req) {
  await connectMongoDB(); 

  const body = await req.json();
  const { snackId, available } = body;

  if (!snackId) {
    return new Response(JSON.stringify({ message: "Snacks ID is required" }), {
      status: 400,
    });
  }

  try {
    const snack = await Snacks.findByIdAndUpdate(
      snackId,
      { available },
      { new: true }
    );

    if (!snack) {
      return new Response(JSON.stringify({ message: "Snacks not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Availability updated", snack }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating availability:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
