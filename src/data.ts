import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  CloudUpload,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import type {
  PageKey,
  Role,
} from "./types";

type NavIcon = ComponentType<any>;

export const navigation: {
  key: PageKey;
  label: string;
  icon: NavIcon;
  roles: Role[];
}[] = [
  { key: "overview", label: "Vue d’ensemble", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "courses", label: "Mes cours", icon: BookOpen, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "documents", label: "Documents", icon: FolderOpen, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "upload", label: "Déposer un fichier", icon: CloudUpload, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "validation", label: "Validations", icon: ShieldCheck, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "administration", label: "Administration", icon: Users, roles: ["administrateur"] },
];

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
