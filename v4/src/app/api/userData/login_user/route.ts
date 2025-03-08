import { NextResponse } from "next/server";
import { generateToken, setToken } from "@/utils/token";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Connect to the MongoDB database
    await connectToDatabase();
    // Find the user with the matching email
    const user = await User.findOne({ email });

    if (!user) {
      // If user is not found or password is incorrect
      return NextResponse.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare hashed password with provided password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Ensure profilePic exists, else use default
    const profilepic = user.profilepic
      ? user.profilepic
      : "/default-profile.png";

    //Handle Usertype for ProjectManager
    if (user.userType == "ProjectManager") {
      // Generate JWT token for the user
      const token = generateToken({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profilepic: profilepic,
        contact: user.contact,
        userType: user.userType,
        UserId: user.UserId,
      });

      const res = NextResponse.json({
        success: true,
        message: "Login successful!",
        ProjectManager: {
          UserId: user.UserId,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          profilepic: profilepic,
          contact: user.contact,
          userType: user.userType,
        },
      });

      // Set the token in the cookie
      setToken(res, token);

      return res;
    } else {
      // Generate JWT token for the user
      const token = generateToken({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profilepic: profilepic, // Ensure correct field is used
        contact: user.contact,
        userType: user.userType,
        UserId: user.UserId,
        userRole: user.userRole,
      });

      const res = NextResponse.json({
        success: true,
        message: "Login successful!",
        user: {
          UserId: user.UserId,
          userRole: user.userRole,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          profilepic: profilepic,
          contact: user.contact,
          userType: user.userType,
        },
      });

      // Set the token in the cookie
      setToken(res, token);
      return res;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to log in. Please try again later.",
    });
  } finally {
  }
}
