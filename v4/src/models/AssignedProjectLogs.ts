import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IAssignedProjectLog extends Document {
  AssignProjectId: string; // Unique Assignment ID
  projectId: string; // The project being assigned
  teamId: string; // The team assigned to the project
  teamName: string; // The name of the team
  assignedBy: { email: string; userId: string }; // Project Manager who assigned the project
  deadline: Date; // Deadline for the assigned project
  createdAt: Date;
  updatedAt: Date;
}

// Define the AssignedProjectLogs Schema
const assignedProjectLogSchema = new Schema<IAssignedProjectLog>(
  {
    AssignProjectId: { type: String, unique: true },
    projectId: { type: String, required: true },
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    assignedBy: {
      email: { type: String, required: true },
      userId: { type: String, required: true },
    },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

// Pre-save hook to auto-generate AssignProjectId like ProjectId
assignedProjectLogSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip if this document already exists

  const lastAssignment = await mongoose
    .model<IAssignedProjectLog>("AssignedProjectLogs")
    .findOne({}, { AssignProjectId: 1 })
    .sort({ AssignProjectId: -1 });

  let newAssignProjectId = "AssignProject-1"; // Default for the first assignment

  if (lastAssignment && lastAssignment.AssignProjectId) {
    const match = lastAssignment.AssignProjectId.match(/\d+$/); // Extract numeric part
    const maxNumber = match ? parseInt(match[0], 10) : 0;
    newAssignProjectId = `AssignProject-${maxNumber + 1}`;
  }

  this.AssignProjectId = newAssignProjectId; // Set the new AssignProjectId
  next();
});

// Export the model
const AssignedProjectLog =
  models?.AssignedProjectLogs ||
  model<IAssignedProjectLog>(
    "AssignedProjectLogs",
    assignedProjectLogSchema,
    "assigned_project_2_team"
  );

export default AssignedProjectLog;
