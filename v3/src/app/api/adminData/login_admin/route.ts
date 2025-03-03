import { NextResponse } from "next/server";
import { generateToken, setToken } from "../../../../utils/token";
import Admin from "@/models/Admin";
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
    // Find the admin with the matching email
    const admin = await Admin.findOne({ email });

    // If user is not found or password is incorrect
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare hashed password with provided password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Ensure profilePic exists, else use default
    const profilepic = admin.profilepic
      ? admin.profilepic
      : "/default-profile.png";

    // Generate JWT token for the admin
    const token = generateToken({
      email: admin.email,
      firstname: admin.firstname,
      lastname: admin.lastname,
      profilepic: profilepic, // Ensure correct field is used
      contact: admin.contact,
      userType: "Admin",
    });

    const res = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        email: admin.email,
        firstname: admin.firstname,
        lastname: admin.lastname,
        profilepic: profilepic,
        contact: admin.contact,
        userType: admin.userType,
      },
    });

    // Set the token in the cookie
    setToken(res, token);

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to log in. Please try again later.",
    });
  } finally {
  }
}
