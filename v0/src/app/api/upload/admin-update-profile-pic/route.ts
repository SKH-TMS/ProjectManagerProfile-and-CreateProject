import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import Admin from "@/models/Admin"; // Use Mongoose Admin model
import { connectToDatabase } from "@/lib/mongodb"; // Use Mongoose connection

export async function POST(req: Request) {
  try {
    console.log("📸 Admin profile picture upload started...");

    await connectToDatabase(); // Ensure DB is connected

    // Extract uploaded file and admin email
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

    // Generate a unique filename based on admin's email
    const fileExtension = path.extname(file.name);
    const fileName = `profile-Admin-${email.replace(
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

    // Update admin's profile picture in MongoDB
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email },
      { profilepic: fileUrl },
      { new: true }
    );

    if (!updatedAdmin) {
      console.error(`❌ Admin with email "${email}" not found in MongoDB.`);
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Admin profile picture updated in database: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      profilePicUrl: fileUrl,
    });
  } catch (error) {
    console.error("❌ Error updating admin profile picture:", error);
    return NextResponse.json(
      { success: false, message: "Profile picture update failed" },
      { status: 500 }
    );
  }
}
