import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  createdBy: string; // Email of the project manager
  UserId?: string; // Unique User ID of the project manager
  AssignedTo?: string; // Unique ID of the Team
  createdAt: Date;
  status: string; // E.g., "Pending", "In Progress", "Completed"
}

// Define Project Schema
const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, "Creator email is required"],
      trim: true,
    },
    UserId: {
      type: String,
      required: [true, "UserId is required"], // New field added
      trim: true,
    },
    AssignedTo: {
      type: String,
      default: "No-One",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Export Project Model
const Project = models?.Project || model<IProject>("Project", projectSchema);
export default Project;
