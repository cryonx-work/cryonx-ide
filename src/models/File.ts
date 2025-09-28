import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFile extends Document {
  projectId: Types.ObjectId;
  path: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId?: Types.ObjectId;
  lastSynced?: Date;
  version: number;
}

const FileSchema = new Schema<IFile>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  path: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "folder"], required: true },
  content: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: "File", default: null },
  lastSynced: { type: Date },
  version: { type: Number, default: 1 },
});

export default mongoose.models.File || mongoose.model<IFile>("File", FileSchema);
