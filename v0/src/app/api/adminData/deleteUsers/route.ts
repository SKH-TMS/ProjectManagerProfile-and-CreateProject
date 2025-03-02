import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req: Request) {
  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid emails provided for deletion" },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Ensure database connection

    // Delete users with matching emails
    const result = await User.deleteMany({ email: { $in: emails } });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} user(s) deleted successfully.`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "No users found with the provided emails." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete users." },
      { status: 500 }
    );
  }
}
