import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    const { emails } = await req.json(); // Extract selected user emails from request body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid users provided for role assignment.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Ensure database connection

    const updateResult = await User.updateMany(
      { email: { $in: emails } },
      { $set: { userRole: "ProjectManager" } }
    );

    if (updateResult.modifiedCount > 0) {
      return NextResponse.json({
        success: true,
        message: `${updateResult.modifiedCount} user(s) assigned as Project Manager successfully.`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No users were updated.",
      });
    }
  } catch (error) {
    console.error("❌ Error assigning Project Manager role:", error);
    return NextResponse.json(
      { success: false, message: "Error assigning Project Manager role." },
      { status: 500 }
    );
  }
}
