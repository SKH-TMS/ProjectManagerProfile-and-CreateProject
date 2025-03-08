import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITeam extends Document {
  teamId: string;
  teamName: string;
  teamLeader: string[]; // Change to store only the userId of the team leader as array
  members: string[]; // Store only userId in members array
  createdAt: Date;
  updatedAt: Date;
}

// Define Schema
const teamSchema = new Schema<ITeam>(
  {
    teamId: { type: String, unique: true },
    teamName: { type: String, required: true },
    teamLeader: { type: [String], required: true },
    members: {
      type: [String], // Members will now only contain an array of userIds
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate teamId
teamSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip if team already exists

  const lastTeam = await mongoose
    .model<ITeam>("Team")
    .findOne({}, { teamId: 1 })
    .sort({ teamId: -1 });

  let newTeamId = "Team-1"; // Default for the first team

  if (lastTeam && lastTeam.teamId) {
    const match = lastTeam.teamId.match(/\d+$/); // Extract numeric part
    const maxNumber = match ? parseInt(match[0], 10) : 0;
    newTeamId = `Team-${maxNumber + 1}`;
  }

  this.teamId = newTeamId;
  next();
});

const Team = models?.Team || model<ITeam>("Team", teamSchema, "teams");

export default Team;
