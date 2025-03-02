import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();

    // Fetch users with userRole "User"
    const users = await User.find({ userRole: "User" });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}
