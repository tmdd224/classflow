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
  id: string;
  name: string;
  code: string;
  progress: number;
  resources: number;
  color: string;
  initials: string;
  responsable?: string;
  class_id?: string;
  semester?: number;
  planned_hours?: number;
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
  id: string;
  name: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  size: string;
  course: string;
  courseId: string | undefined;
  date: string;
  color: string;
  uploaded_by: string;
  status: DocumentStatus;
  description?: string;
  rejection_reason?: string;
};

export type DocumentEvent = {
  id: string;
  document_id: string;
  action: string;
  reason: string | null;
  created_at: string;
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
  class_id: string | null;
  semester: number;
  planned_hours: number;
};

/** Ligne de la table `documents` dans Supabase. */
export type DocumentDB = {
  id: string;
  title: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  description: string | null;
  course_id: string | null;
  uploaded_by: string;
  status: DocumentStatus;
  visibility: string;
  class_id: string | null;
  created_at: string;
  rejection_reason: string | null;
};

/** Ligne de la table `classes` dans Supabase. */
export type ClassDB = {
  id: string;
  name: string;
  niveau: string;
  effectif: number;
  responsable: string | null;
};
