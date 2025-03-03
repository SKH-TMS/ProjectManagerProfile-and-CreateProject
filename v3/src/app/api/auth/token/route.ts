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
    let user = null,
      admin = null;
    let userType = "User"; // Default role
    //
    const TypeofUser = GetUserType(token);
    if (requestedUserType == TypeofUser) {
      if (requestedUserType === "Admin") {
        admin = await Admin.findOne({ email: decodedUser.email });
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
      } else {
        user = await User.findOne({ email: decodedUser.email });

        if (!user) {
          return NextResponse.json(
            {
              success: false,
              message: "User not found",
            },
            { status: 404 }
          );
        }
        const requestedUserROle = requestBody.userRole || "user";
        const RoleofUser = GetuserRole(token);
        if (requestedUserROle == RoleofUser) {
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
              userRole: user.userRole,
            },
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Unotherized Access: You are not the Project Manager",
            },
            { status: 401 }
          );
        }
        //
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
