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

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  class_id: string | null;
  active: boolean;
};

/** Ligne de la table `courses` dans Supabase. */
export type CourseDB = {
  id: string;
  name: string;
  code: string;
  progress: number;
  resources: number;
  color: string;
  initials: string;
  responsable: string | null;
};

/** Ligne de la table `documents` dans Supabase. */
export type DocumentDB = {
  id: string;
  name: string;
  type: string;
  course: string;
  course_id: string | null;
  date: string;
  size: string;
  color: string;
  storage_path: string | null;
};

/** Ligne de la table `classes` dans Supabase. */
export type ClassDB = {
  id: string;
  name: string;
  niveau: string;
  effectif: number;
  responsable: string | null;
};
