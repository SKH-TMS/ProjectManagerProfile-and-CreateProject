import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    const { users } = await req.json(); // Extract users from request body

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid users provided for update." },
        { status: 400 }
      );
    }

    await connectToDatabase(); // Ensure database connection

    let updateCount = 0;

    for (const user of users) {
      const { email, firstname, lastname, contact } = user;

      // Ensure required fields are provided
      if (!email || (!firstname && !lastname && !contact)) {
        continue; // Skip invalid user updates
      }

      const updateResult = await User.updateOne(
        { email },
        { $set: { firstname, lastname, contact } }
      );

      if (updateResult.modifiedCount > 0) {
        updateCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updateCount} user(s) updated successfully.`,
    });
  } catch (error) {
    console.error("❌ Error updating users:", error);
    return NextResponse.json(
      { success: false, message: "Error updating users." },
      { status: 500 }
    );
  }
}
