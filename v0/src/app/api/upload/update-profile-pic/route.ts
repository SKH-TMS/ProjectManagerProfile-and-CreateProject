import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    console.log("📸 Profile picture upload started...");

    await connectToDatabase();

    // Extract uploaded file and user email
    const formData = await req.formData();
    const file = formData.get("profilePic") as File | null;
    const emailRaw = formData.get("email");

    // Ensure email is a string before using trim()
    const email =
      typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : null;

    if (!file) {
      console.error("❌ No file received");
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!email) {
      console.error("❌ No email received or invalid email format");
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename based on the user's email
    const fileExtension = path.extname(file.name);
    const fileName = `profile-User-${email.replace(
      /[@.]/g,
      "_"
    )}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    // Read file buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log(`✅ File uploaded successfully: ${filePath}`);

    // Update the user's profile picture in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { profilepic: fileUrl },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`❌ User with email "${email}" not found in MongoDB.`);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Profile picture updated in database: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      profilePicUrl: fileUrl,
    });
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);
    return NextResponse.json(
      { success: false, message: "Profile picture update failed" },
      { status: 500 }
    );
  }
}
