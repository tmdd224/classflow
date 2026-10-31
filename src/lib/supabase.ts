import { createClient } from "@supabase/supabase-js";
import type {
  Course,
  CourseDB,
  ClassDB,
  Classe,
  DocumentDB,
  DocumentItem,
  Profile,
  User,
} from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configuration Supabase manquante : définissez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans le fichier .env.local à la racine du projet."
  );
}

/**
 * Client Supabase côté frontend (clé publishable uniquement, jamais la clé secrète/service_role).
 * Il est utilisé pour l'authentification et, plus tard, pour lire/écrire les données.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Récupère la liste des cours depuis la table `courses` de Supabase.
 */
export async function fetchCoursesFromDB(): Promise<CourseDB[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Impossible de charger les cours depuis Supabase : ${error.message}`
    );
  }

  return (data ?? []) as CourseDB[];
}

/**
 * Récupère la liste des documents depuis la table `documents` de Supabase.
 */
export async function fetchDocumentsFromDB(): Promise<DocumentDB[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Impossible de charger les documents depuis Supabase : ${error.message}`
    );
  }

  return (data ?? []) as DocumentDB[];
}

/**
 * Récupère la liste des classes depuis la table `classes` de Supabase.
 */
export async function fetchClassesFromDB(): Promise<ClassDB[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Impossible de charger les classes depuis Supabase : ${error.message}`
    );
  }

  return (data ?? []) as ClassDB[];
}

/**
 * Récupère la liste des profils utilisateurs depuis la table `profiles` de Supabase.
 */
export async function fetchProfilesFromDB(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(
      `Impossible de charger les profils depuis Supabase : ${error.message}`
    );
  }

  return (data ?? []) as Profile[];
}

/**
 * Convertit une ligne `courses` de Supabase en `Course` de l'application.
 */
export function dbToCourse(db: CourseDB): Course {
  return {
    name: db.name,
    code: db.code,
    progress: db.progress,
    resources: db.resources,
    color: db.color,
    initials: db.initials,
    responsable: db.responsable ?? undefined,
  };
}

/**
 * Convertit une ligne `documents` de Supabase en `DocumentItem` de l'application.
 */
export function dbToDocumentItem(db: DocumentDB): DocumentItem {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    course: db.course,
    courseId: db.course_id ?? undefined,
    date: db.date,
    size: db.size,
    color: db.color,
    status: "approved",
    reviewComment: "",
  };
}

/**
 * Convertit une ligne `classes` de Supabase en `Classe` de l'application.
 */
export function dbToClasse(db: ClassDB): Classe {
  return {
    id: db.id,
    name: db.name,
    niveau: db.niveau,
    effectif: db.effectif,
    responsable: db.responsable ?? undefined,
  };
}

/**
 * Convertit une ligne `profiles` de Supabase en `User` de l'application.
 */
export function dbToUser(db: Profile): User {
  return {
    id: db.id,
    name: db.full_name ?? db.email?.split("@")[0] ?? "Utilisateur",
    email: db.email ?? "",
    role: db.role,
    classe: db.class_id ?? undefined,
    status: db.active ? "actif" : "inactif",
  };
}

/**
 * Construit le registre des ressources par cours à partir de la liste des documents.
 * Remplace le registre statique `courseResources` de `data.ts`.
 */
export function buildCourseResources(
  documents: DocumentItem[],
  courses: Course[]
): Record<string, { name: string; type: string; date: string }[]> {
  const resources: Record<string, { name: string; type: string; date: string }[]> = {};

  for (const doc of documents) {
    if (!resources[doc.course]) {
      resources[doc.course] = [];
    }
    resources[doc.course].push({
      name: doc.name,
      type: doc.type,
      date: doc.date,
    });
  }

  // S'assurer que tous les cours ont une entrée (même vide)
  for (const course of courses) {
    if (!resources[course.name]) {
      resources[course.name] = [];
    }
  }

  return resources;
}

