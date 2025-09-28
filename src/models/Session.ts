import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICursor {
  line: number;
  column: number;
}

export interface IOpenFile {
  fileId: Types.ObjectId;
  version: number;
  cursor: ICursor;
}

export interface ISession extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  openFiles: IOpenFile[]; 
  cursor: ICursor;
  createdAt: Date;
  updatedAt: Date;
}

const CursorSchema = new Schema(
  {
    line: { type: Number, required: true },
    column: { type: Number, required: true },
  },
  { _id: false }
);

const OpenFileSchema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    version: { type: Number, default: 1 },
    cursor: { type: CursorSchema, required: true },
  },
  { _id: false }
);


const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  openFiles: { type: [OpenFileSchema], default: [] },
  cursor: { type: CursorSchema, required: true }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// update updatedAt
SessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
