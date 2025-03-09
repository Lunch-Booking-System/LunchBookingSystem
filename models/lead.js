import mongoose, { Schema, models } from "mongoose";

const LeadSchema = new Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Lead = models?.Lead || mongoose.model("Lead", LeadSchema);
export default Lead;
