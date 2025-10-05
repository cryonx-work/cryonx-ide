export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  isOpen?: boolean;
  file?: File;
  path?: string; // optional, lưu đường dẫn tuyệt đối
  projectId?: string;
}
