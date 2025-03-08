import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import AssignedProjectLog from "@/models/AssignedProjectLogs";
import { getToken, GetUserType } from "@/utils/token";

export async function GET(req: NextRequest) {
  try {
    // Validate the token
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
          message: "Unauthorized access. You are not a Project Manager.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Step 1: Fetch all assigned ProjectIds from AssignedProjectLogs
    const assignedProjects = await AssignedProjectLog.find({}).select(
      "projectId"
    );

    const assignedProjectIds = assignedProjects.map((log) => log.projectId);

    // Step 2: Fetch projects that are NOT in AssignedProjectLogs
    const projects = await Project.find({
      ProjectId: { $nin: assignedProjectIds },
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("❌ Error fetching unassigned projects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch unassigned projects." },
      { status: 500 }
    );
  }
}
