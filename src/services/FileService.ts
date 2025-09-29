import File, { IFile } from "@/models/File";
import { Types } from "mongoose";

export async function createFile(data: Partial<IFile>) {
  const file = await File.create({
    projectId: data.projectId,
    path: data.path,
    name: data.name,
    type: data.type,
    content: data.content || "",
    parentId: data.parentId || null,
    version: 1,
    lastSynced: new Date(),
  });
  return file;
}

export async function getFileById(id: string) {
  return File.findById(new Types.ObjectId(id));
}

export async function listFiles(projectId?: string) {
  return projectId ? File.find({ projectId }) : File.find();
}

export async function updateFile(id: string, data: Partial<IFile>) {
  const file = await File.findById(id);
  if (!file) return null;

  if (data.version && data.version !== file.version) {
    throw new Error("VERSION_CONFLICT");
  }

  if (data.name) file.name = data.name;
  if (data.path) file.path = data.path;
  if (data.type) file.type = data.type;
  if (data.content !== undefined) file.content = data.content;

  file.version += 1;
  file.lastSynced = new Date();

  return file.save();
}

export async function deleteFile(id: string) {
  return File.findByIdAndDelete(id);
}
