import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  ownerId: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// update updatedAt trước khi save
ProjectSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
