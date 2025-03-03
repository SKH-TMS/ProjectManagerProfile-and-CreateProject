import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import { getToken, verifyToken, GetuserRole } from "@/utils/token";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Extract token from request
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }
    const userRole = await GetuserRole(token);
    if (!userRole || userRole != "ProjectManager") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access you are not an admin" },
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

    const { title, description, deadline } = await req.json();

    if (!title || !description || !deadline) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description, and deadline are required.",
        },
        { status: 400 }
      );
    }

    // Validate deadline format
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid deadline format." },
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

    // Create new project with UserId, Email, and Deadline
    const newProject = await Project.create({
      title,
      description,
      createdByUserEmail: decodedUser.email, // Email of Project Manager
      createdByUserId: projectManager.UserId, // Fetch UserId from database
      deadline: parsedDeadline, // Store deadline
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
