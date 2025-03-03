import mongoose, { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define IUser interface
export interface IUser extends Document {
  UserId: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
  profilepic: String;
  userType: String;
  userRole: String;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// Define User Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      match: [
        /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/,
        "Invalid email format",
      ],
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, "password is required"] },
    firstname: {
      type: String,
      required: [true, "firstname is required"],
      match: [/^[A-Za-z]+([ '-][A-Za-z]+)*$/, "Invalid first name"],
    },
    lastname: {
      type: String,
      required: [true, "lastname is required"],
      match: [/^[A-Za-z]+([ '-][A-Za-z]+)*$/, "Invalid last name"],
    },
    contact: {
      type: String,
      match: [
        /^(?:\+?(\d{1,4})[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/,
        "Invalid contact number",
      ],
    },
    profilepic: {
      type: String,
      required: [true, "Profile picture is required"],
    },
    userType: { type: String, required: [true, "User type is required"] },
    userRole: { type: String, required: true },
    UserId: { type: String, unique: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

userSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Pre-save hook to assign auto-incremented `UserId`
userSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip if user already exists

  const lastUser = await mongoose
    .model<IUser>("User")
    .findOne({}, { UserId: 1 })
    .sort({ UserId: -1 });

  let newUserId = "User-1"; // Default for the first user

  if (lastUser && lastUser.UserId) {
    const match = lastUser.UserId.match(/\d+$/); // Extract numeric part
    const maxNumber = match ? parseInt(match[0], 10) : 0;
    newUserId = `User-${maxNumber + 1}`;
  }

  this.UserId = newUserId;
  next();
});

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (user.isModified("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

// Method to compare passwords (for login)
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export User Model
const User = models?.User || model<IUser>("User", userSchema, "register_user");

export default User;
