import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import Team from "@/models/Team";
import AssignedProjectLog from "@/models/AssignedProjectLogs"; // Import AssignedProjectLog Model
import { getToken, verifyToken, GetUserType } from "@/utils/token";

export async function POST(req: NextRequest) {
  try {
    // Extract token from request
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    const userType = await GetUserType(token);
    if (!userType || userType !== "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access, you are not a Project Manager",
        },
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

    await connectToDatabase();

    const { title, description, deadline, assignedTeam } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required.",
        },
        { status: 400 }
      );
    }

    // If a team is selected, validate the deadline
    let parsedDeadline = null;
    if (assignedTeam) {
      if (!deadline) {
        return NextResponse.json(
          {
            success: false,
            message: "Deadline is required when assigning a team.",
          },
          { status: 400 }
        );
      }

      // Validate deadline format
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid deadline format." },
          { status: 400 }
        );
      }
    }

    // Fetch Project Manager details using email
    const projectManager = await User.findOne({ email: decodedUser.email });
    if (!projectManager) {
      return NextResponse.json(
        { success: false, message: "Project Manager not found." },
        { status: 404 }
      );
    }

    const teamData = assignedTeam
      ? await Team.findOne({ teamId: assignedTeam })
      : { teamId: "no-one", teamName: "no-one" };

    // Create new project
    const newProject = new Project({
      title,
      description,
      deadline: parsedDeadline || null, // Only set deadline if team is assigned
      createdBy: { email: projectManager.email, userId: projectManager.UserId },
    });

    await newProject.save();

    // If a team is assigned, log the assignment in the AssignedProjectLogs
    if (assignedTeam) {
      const assignedLog = new AssignedProjectLog({
        projectId: newProject.ProjectId,
        teamId: teamData.teamId,
        teamName: teamData.teamName,
        assignedBy: {
          email: projectManager.email,
          userId: projectManager.UserId,
        },
        deadline: parsedDeadline,
      });

      await assignedLog.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: assignedTeam
          ? "Project created and assigned to team successfully!"
          : "Project created successfully without assigning a team.",
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
