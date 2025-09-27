import {File } from 'lucide-react';


export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  isOpen?: boolean;
  file: File;
}