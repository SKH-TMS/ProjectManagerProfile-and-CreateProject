import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
import Project from "@/models/Project"; // Import Project Model
import AssignedProjectLog from "@/models/AssignedProjectLogs"; // Import AssignedProjectLog Model
import { getToken, verifyToken, GetUserType } from "@/utils/token";
import User from "@/models/User";

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

    // Extract data from the request
    const { teamName, teamLeader, members, assignedProject, deadline } =
      await req.json();

    // Validate fields
    if (!teamName || !teamLeader || !members || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Extract only userIds for members
    const memberUserIds = members
      .filter((member: { email: string }) => member.email !== teamLeader.email)
      .map((member: { userId: string }) => member.userId);

    // Create new team
    const newTeam = new Team({
      teamName,
      teamLeader: teamLeader.userId,
      members: memberUserIds,
    });

    await newTeam.save();

    // If a project is assigned, update the project model and log the assignment in AssignedProjectLogs
    if (assignedProject) {
      if (deadline) {
        const project = await Project.findOne({ ProjectId: assignedProject });

        if (!project) {
          return NextResponse.json(
            { success: false, message: "Project not found" },
            { status: 404 }
          );
        }

        // Fetch Project Manager details using the token
        const decodedUser = verifyToken(token);
        if (!decodedUser || !decodedUser.email) {
          return NextResponse.json(
            { success: false, message: "Invalid token." },
            { status: 403 }
          );
        }

        // Fetch Project Manager details using email
        const projectManager = await User.findOne({ email: decodedUser.email });
        if (!projectManager) {
          return NextResponse.json(
            { success: false, message: "Project Manager not found." },
            { status: 404 }
          );
        }

        // Create the assignment log in AssignedProjectLogs
        const assignedLog = new AssignedProjectLog({
          projectId: project.ProjectId,
          teamId: newTeam.teamId,
          teamName: newTeam.teamName,
          assignedBy: {
            email: projectManager.email,
            userId: projectManager.UserId,
          }, // Storing Project Manager info
          deadline, // Store the deadline at the time of assignment
        });

        // Save the assignment log
        await assignedLog.save();
      } else
        return NextResponse.json(
          { success: false, message: "Deadline not defiend" },
          { status: 500 }
        );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: assignedProject
        ? "Team created and assigned to the project successfully!"
        : "Team created successfully without project assignment.",
    });
  } catch (error) {
    console.error("❌ Error creating team:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create team" },
      { status: 500 }
    );
  }
}
