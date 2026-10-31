export type PageKey =
  | "overview"
  | "courses"
  | "documents"
  | "upload"
  | "validation"
  | "administration"
  | "settings";

export type DocumentStatus = "pending" | "approved" | "rejected";

export type Role = "etudiant" | "responsable" | "administrateur";

export const roleLabels: Record<Role, string> = {
  etudiant: "Étudiant",
  responsable: "Responsable pédagogique",
  administrateur: "Administrateur",
};

export type CourseResource = { name: string; type: string; date: string };

export type Course = {
  name: string;
  code: string;
  progress: number;
  resources: number;
  color: string;
  initials: string;
  responsable?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  classe?: string;
  status: "actif" | "inactif";
};

export type Classe = {
  id: string;
  name: string;
  niveau: string;
  effectif: number;
  responsable?: string;
};

export type DocumentItem = {
  id?: string;
  name: string;
  type: string;
  course: string;
  courseId?: string;
  date: string;
  size: string;
  color: string;
  description?: string;
  file?: File;
  uploadedBy?: string;
  status?: DocumentStatus;
  reviewComment?: string;
};
