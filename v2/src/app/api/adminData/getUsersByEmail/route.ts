import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email list provided." },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Ensure database connection

    // Fetch users matching the provided emails
    const users = await User.find({ email: { $in: emails } }).lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users by email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users by email." },
      { status: 500 }
    );
  }
}
