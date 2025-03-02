import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { generateToken, setToken } from "../../../../utils/token";
//import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import User from "@/models/User";
export async function POST(req: Request) {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      contact,
      userType,
      userRole,
    } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }
    // Connect to MongoDB
    await connectToDatabase();

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already registered" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error while finding user:", error);
      return NextResponse.json(
        { error: "Failed to find user" },
        { status: 500 }
      );
    }

    // Hash the password before storing
    //const hashedPassword = await bcrypt.hash(password, 10);
    // Default profile picture
    const profilepic = "/default-profile.png";

    // Get number of users
    const n_users = await User.countDocuments();
    const assignid = `User-${n_users + 1}`;
    console.log(assignid);
    // Insert new user into database
    await User.create({
      userRole,
      firstname,
      lastname,
      email,
      password, // Store the hashed password
      contact: contact || "", // Optional field
      profilepic: profilepic,
      userType,
      UserId: assignid,
    });
    console.log("user created");
    // Generate JWT token
    const token = generateToken({
      email,
      firstname,
      lastname,
      profilepic,
      contact,
      userType,
      UserId: assignid,
      userRole,
    });

    // Set the token as an HttpOnly cookie
    const res = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
      },
      {
        status: 201,
      }
    );
    setToken(res, token);

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: "Failed to register" });
  } finally {
  }
}
