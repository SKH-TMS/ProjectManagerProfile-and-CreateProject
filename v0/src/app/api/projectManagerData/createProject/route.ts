import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import { getToken, verifyToken } from "@/utils/token";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Extract token from request
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    // Verify token and extract user details
    const decodedUser = verifyToken(token);
    if (!decodedUser || !decodedUser.email) {
      return NextResponse.json(
        { success: false, message: "Invalid token." },
        { status: 403 }
      );
    }

    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required." },
        { status: 400 }
      );
    }

    // Fetch User ID from database using email
    const projectManager = await User.findOne({ email: decodedUser.email });
    if (!projectManager) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Create new project with UserId and Email
    const newProject = await Project.create({
      title,
      description,
      createdBy: decodedUser.email, // Email of Project Manager
      UserId: projectManager.UserId, // Fetch UserId from database
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully!",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Server error while creating project." },
      { status: 500 }
    );
  }
}
