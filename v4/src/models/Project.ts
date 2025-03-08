import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  ProjectId: string;
  title: string;
  description: string;
  createdBy: { email: string; userId: string }; // Project Manager
  updatedAt: Date;
  createdAt: Date;
  status: string; // E.g., "Pending", "In Progress", "Completed"
}

const projectSchema = new Schema<IProject>(
  {
    ProjectId: { type: String, unique: true },
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
      email: {
        type: String,
        required: [true, "Creator email is required"],
        trim: true,
      },
      userId: {
        type: String,
        required: [true, "UserId is required"],
        trim: true,
      },
    },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Pre-save hook to assign auto-incremented `ProjectId`
projectSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip if project already exists

  const lastProject = await mongoose
    .model<IProject>("Project")
    .findOne({}, { ProjectId: 1 })
    .sort({ ProjectId: -1 });

  let newProjectId = "Project-1"; // Default for the first Project

  if (lastProject && lastProject.ProjectId) {
    const match = lastProject.ProjectId.match(/\d+$/); // Extract numeric part
    const maxNumber = match ? parseInt(match[0], 10) : 0;
    newProjectId = `Project-${maxNumber + 1}`;
  }

  this.ProjectId = newProjectId;
  next();
});

const Project = models?.Project || model<IProject>("Project", projectSchema);

export default Project;
