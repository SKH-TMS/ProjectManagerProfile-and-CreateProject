import { NextResponse } from "next/server";
import { getToken, verifyToken, GetUserType, GetuserRole } from "@/utils/token";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    console.log("🔍 Token verification started...");

    await connectToDatabase(); // Connect to MongoDB using Mongoose

    const token = getToken(req); // Extract token from request

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided",
        },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const decodedUser = verifyToken(token);

    if (!decodedUser || !decodedUser.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 403 }
      );
    }

    // Parse the request body
    let requestBody: { userType?: string; userRole?: string } = {};
    try {
      requestBody = await req.json();
    } catch (error) {
      console.warn("⚠️ No JSON body received.");
    }

    const requestedUserType = requestBody.userType || "User"; // Default to "User"

    let userType = "User"; // Default role
    //
    const TypeofUser = GetUserType(token);
    //to check if the user credentials are similer
    if (requestedUserType == TypeofUser) {
      if (requestedUserType === "Admin") {
        const admin = await Admin.findOne({ email: decodedUser.email });
        userType = "Admin";
        //

        if (!admin) {
          return NextResponse.json(
            {
              success: false,
              message: "admin not found",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Token valid",
          admin: {
            email: admin.email,
            firstname: admin.firstname,
            lastname: admin.lastname,
            profilepic: admin.profilepic || "/default-profile.png",
            contact: admin.contact || "",
            userType, // Distinguish between User and Admin
          },
        });
        //
        //
      } else if (requestedUserType === "User") {
        const user = await User.findOne({ email: decodedUser.email });
        userType = "User";
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              message: "User not found",
            },
            { status: 404 }
          );
        }

        //
        return NextResponse.json({
          success: true,
          message: "Token valid",
          user: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            profilepic: user.profilepic || "/default-profile.png",
            contact: user.contact || "",
            userType,
          },
        });

        //
      } else if (requestedUserType === "ProjectManager") {
        const ProjectManager = await User.findOne({ email: decodedUser.email });
        userType = "ProjectManager";
        if (!ProjectManager) {
          return NextResponse.json(
            {
              success: false,
              message: "User not found",
            },
            { status: 404 }
          );
        }

        //
        return NextResponse.json({
          success: true,
          message: "Token valid",
          ProjectManager: {
            email: ProjectManager.email,
            firstname: ProjectManager.firstname,
            lastname: ProjectManager.lastname,
            profilepic: ProjectManager.profilepic || "/default-profile.png",
            contact: ProjectManager.contact || "",
            userType,
          },
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "User Type is wrong",
      });
    }
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying token",
      },
      { status: 500 }
    );
  }
}
