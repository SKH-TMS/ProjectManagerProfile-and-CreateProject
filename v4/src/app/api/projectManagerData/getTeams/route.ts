import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
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

    // Fetch all teams
    const teams = await Team.find({}, { teamId: 1, teamName: 1 });

    return NextResponse.json({ success: true, teams });
  } catch (error) {
    console.error("❌ Error fetching teams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch teams." },
      { status: 500 }
    );
  }
}
