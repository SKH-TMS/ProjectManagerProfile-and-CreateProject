import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import { getToken, GetUserType } from "@/utils/token";
import Team from "@/models/Team";
import AssignedProjectLog from "@/models/AssignedProjectLogs"; // Import the AssignedProjectLogs model

export async function POST(req: NextRequest) {
  try {
    // Validate the token
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    // Check if the user is a ProjectManager
    const userType = await GetUserType(token);
    if (!userType || userType !== "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. You are not a Project Manager.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Extract projectId, teamId, and deadline from the request body
    const { projectId, teamId, deadline } = await req.json();

    // Validate projectId and teamId
    if (!projectId || !teamId || !deadline) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID, Team ID, and Deadline are required.",
        },
        { status: 400 }
      );
    }

    // Fetch the project to verify existence
    const project = await Project.findOne({ ProjectId: projectId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    // Step 1: Check if the project is already assigned in the AssignedProjectLogs collection
    const existingAssignment = await AssignedProjectLog.findOne({ projectId });
    if (existingAssignment) {
      return NextResponse.json(
        { success: false, message: "Project is already assigned to a team." },
        { status: 400 }
      );
    }

    // Fetch the team to verify existence
    const team = await Team.findOne({ teamId: teamId });
    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found." },
        { status: 404 }
      );
    }

    // Create a new AssignedProjectLog to log the project assignment
    const assignedLog = new AssignedProjectLog({
      projectId,
      teamId,
      teamName: team.teamName,
      assignedBy: {
        email: project.createdBy.email, // Assuming the project manager's email is stored here
        userId: project.createdBy.userId, // Assuming the project manager's userId is stored here
      },
      deadline: new Date(deadline), // Save the deadline from the request
    });

    await assignedLog.save();
    return NextResponse.json(
      { success: true, message: "Project assigned successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error assigning project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign project." },
      { status: 500 }
    );
  }
}
