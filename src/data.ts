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
  DocumentItem,
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

export function downloadDocument(doc: DocumentItem) {
  if (!doc.file) {
    alert(
      "Ce document est une donnée de démonstration. Seuls les fichiers que tu as déposés peuvent être téléchargés pour le moment."
    );
    return;
  }

  const url = URL.createObjectURL(doc.file);
  const link = document.createElement("a");

  link.href = url;
  link.download = doc.file.name;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
