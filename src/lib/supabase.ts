import { createClient } from "@supabase/supabase-js";
import type {
  Course,
  CourseDB,
  ClassDB,
  Classe,
  DocumentDB,
  DocumentItem,
  DocumentEvent,
  Profile,
  User,
} from "../types";
import { formatFileSize } from "../data";

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
    id: db.id,
    name: db.name,
    code: db.code,
    progress: db.progress,
    resources: db.resources,
    color: db.color,
    initials: db.initials,
    responsable: db.responsable ?? undefined,
    class_id: db.class_id ?? undefined,
    semester: db.semester,
    planned_hours: db.planned_hours,
  };
}

/**
 * Convertit une ligne `documents` de Supabase en `DocumentItem` de l'application.
 */
export function dbToDocumentItem(db: DocumentDB): DocumentItem {
  const color =
    db.mime_type === "application/pdf"
      ? "violet"
      : db.mime_type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ? "blue"
        : db.mime_type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          ? "orange"
          : "gray";

  return {
    id: db.id,
    name: db.title,
    file_name: db.file_name,
    storage_path: db.storage_path,
    mime_type: db.mime_type,
    size_bytes: db.size_bytes,
    size: formatFileSize(db.size_bytes),
    courseId: db.course_id ?? undefined,
    date: db.created_at,
    color,
    uploaded_by: db.uploaded_by,
    status: db.status,
    description: db.description ?? undefined,
    rejection_reason: db.rejection_reason ?? undefined,
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

  const courseById = new Map(courses.map((c) => [c.id, c.name]));

  for (const doc of documents) {
    const courseName =
      doc.courseId !== undefined ? courseById.get(doc.courseId) ?? "—" : "—";
    if (!resources[courseName]) {
      resources[courseName] = [];
    }
    resources[courseName].push({
      name: doc.name,
      type: doc.mime_type,
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

/**
 * Extensions autorisées côté client.
 */
export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "zip",
  "ipynb",
] as const;

/**
 * Taille maximale autorisée : 20 Mo.
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Déduit le mime_type à partir de l'extension du fichier.
 * N'utilise pas file.type.
 */
export function mimeTypeFromExtension(extension: string): string | null {
  switch (extension.toLowerCase()) {
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "csv":
      return "text/csv";
    case "txt":
      return "text/plain";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "zip":
      return "application/zip";
    case "ipynb":
      return "application/x-ipynb+json";
    default:
      return null;
  }
}

/**
 * Traduit un mime_type en libellé lisible (PDF, Word, PowerPoint, Excel, CSV, Image, ZIP, Notebook, Texte).
 * Jamais le mime_type brut à l'écran.
 */
export function typeLabelFromMimeType(mime_type: string): string {
  switch (mime_type) {
    case "application/pdf":
      return "PDF";
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "Word";
    case "application/vnd.ms-powerpoint":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "PowerPoint";
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "Excel";
    case "text/csv":
      return "CSV";
    case "text/plain":
      return "Texte";
    case "image/png":
    case "image/jpeg":
      return "Image";
    case "application/zip":
      return "ZIP";
    case "application/x-ipynb+json":
      return "Notebook";
    default:
      return "Fichier";
  }
}

const MONTHS_FR_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/**
 * Formate une date ISO au format français « 31 oct. 2026 ».
 */
export function formatDateFR(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Valide un fichier côté client (extension + taille).
 * Retourne { ok: true, mime_type } ou { ok: false, error }.
 */
export function validateFile(file: File): {
  ok: true;
  mime_type: string;
} | { ok: false; error: string } {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  // Un fichier sans extension (dossier déposé tel quel) est refusé
  if (!extension) {
    return {
      ok: false,
      error:
        "Un dossier ne peut pas être envoyé tel quel : sélectionnez ses fichiers ou compressez-le en .zip",
    };
  }

  const mime_type = mimeTypeFromExtension(extension);

  if (!mime_type) {
    return {
      ok: false,
      error:
        "Extension non autorisée. Formats acceptés : PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV, TXT, PNG, JPG, JPEG, ZIP, IPYNB.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: `Fichier trop volumineux (${formatFileSize(file.size)}). Taille maximale : 20 Mo.`,
    };
  }

  return { ok: true, mime_type };
}

/**
 * Construit le chemin de stockage dans le bucket « documents » :
 * {class_id}/{course_id}/{uuid}.{extension}
 */
export function buildStoragePath(
  classId: string | null | undefined,
  courseId: string,
  extension: string
): string {
  const safeClassId = classId ?? "inconnu";
  const uuid = crypto.randomUUID();
  return `${safeClassId}/${courseId}/${uuid}.${extension}`;
}

/**
 * Envoie un fichier dans le bucket privé « documents » de Supabase Storage.
 */
export async function uploadDocumentToStorage(
  file: File,
  storagePath: string,
  mimeType: string
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const { error } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("permission") ||
        error.message.includes("droit") ||
        error.message.includes("forbidden")
          ? "Droit refusé pour l'envoi au stockage."
          : `Erreur de stockage : ${error.message}`,
    };
  }

  return { ok: true, path: storagePath };
}

/**
 * Insère une ligne dans la table `documents` avec les colonnes autorisées.
 * N'envoie ni status, ni visibility, ni class_id : gérées par la base.
 */
export async function insertDocument(document: {
  title: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  description: string | null;
  course_id: string | null;
  uploaded_by: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        title: document.title,
        file_name: document.file_name,
        storage_path: document.storage_path,
        mime_type: document.mime_type,
        size_bytes: document.size_bytes,
        description: document.description,
        course_id: document.course_id,
        uploaded_by: document.uploaded_by,
      },
    ])
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("permission") ||
        error.message.includes("droit") ||
        error.message.includes("forbidden")
          ? "Droit refusé pour l'enregistrement en base."
          : `Erreur d'enregistrement : ${error.message}`,
    };
  }

  return { ok: true, id: data.id };
}

/**
 * Crée une URL signée valide 60 secondes pour télécharger un document.
 */
export async function getDocumentSignedUrl(
  storagePath: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 60);

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("permission") ||
        error.message.includes("droit") ||
        error.message.includes("forbidden")
          ? "Droit refusé pour le téléchargement."
          : `Erreur de téléchargement : ${error.message}`,
    };
  }

  return { ok: true, url: data.signedUrl };
}

/**
 * Traduit une erreur Supabase en message français lisible.
 * Consigne aussi l'erreur brute en console pour le débogage.
 */
export function translateDbError(error: unknown): string {
  const err = error as { message?: string; code?: string; details?: string; hint?: string };
  const message = err.message?.toLowerCase() ?? "";
  console.error("Erreur Supabase brute:", { message: err.message, code: err.code, details: err.details, hint: err.hint });
  if (message.includes("permission") || message.includes("droit") || message.includes("forbidden")) {
    return "Droit refusé par le serveur.";
  }
  if (message.includes("row-level security") || message.includes("row level security")) {
    return "Accès refusé par la politique de sécurité des données.";
  }
  if (message.includes("not found") || message.includes("introuvable")) {
    return "Élément introuvable.";
  }
  if (message.includes("network") || message.includes("fetch") || message.includes("echec")) {
    return "Erreur réseau. Vérifiez votre connexion.";
  }
  if (message.includes("duplicate") || message.includes("déjà existant") || message.includes("already exists")) {
    return "Cet élément existe déjà.";
  }
  if (message.includes("null value") || message.includes("valeur nulle") || message.includes("not-null")) {
    return "Champ obligatoire manquant.";
  }
  if (message.includes("check constraint") || message.includes("contrainte de vérification")) {
    return "La donnée ne respecte pas une contrainte de validation.";
  }
  if (message.includes("foreign key") || message.includes("clé étrangère")) {
    return "Référence invalide vers une autre table.";
  }
  if (message.includes("unique") || message.includes("unicité")) {
    return "Une entrée avec cette valeur existe déjà.";
  }
  return `Erreur inattendue du serveur : ${err.message ?? "inconnue"}`;
}

/**
 * Valide, refuse ou rouvre un document via la fonction RPC `review_document`.
 * p_decision: 'approved' | 'rejected' | 'pending'
 * p_comment: motif obligatoire pour un refus ou une réouverture.
 */
export async function reviewDocument(
  documentId: string,
  decision: "approved" | "rejected" | "pending",
  comment: string | null
): Promise<{
  ok: true;
} | { ok: false; error: string; code?: string; message?: string }> {
  const { error } = await supabase.rpc("review_document", {
    p_document_id: documentId,
    p_decision: decision,
    p_comment: comment,
  });

  if (error) {
    console.error("Erreur review_document:", error);
    return {
      ok: false,
      error: translateDbError(error),
      code: (error as { code?: string }).code,
      message: (error as { message?: string }).message,
    };
  }

  return { ok: true };
}

/**
 * Récupère l'historique des événements d'un document depuis `document_events`.
 */
export async function fetchDocumentEvents(
  documentId: string
): Promise<{ ok: true; events: DocumentEvent[] } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("document_events")
    .select("id, document_id, action, reason, created_at")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: translateDbError(error) };
  }

  return { ok: true, events: (data ?? []) as DocumentEvent[] };
}

/**
 * Active ou désactive un compte utilisateur (administrateur uniquement).
 */
export async function toggleUserActive(
  userId: string,
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("id", userId);

  if (error) {
    return { ok: false, error: translateDbError(error) };
  }
  return { ok: true };
}

/**
 * Crée une classe (administrateur uniquement).
 */
export async function createClass(
  name: string,
  niveau: string,
  responsableId: string | null
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("classes")
    .insert([{ name, niveau, effectif: 0, responsable: responsableId ?? null }])
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: translateDbError(error) };
  }
  return { ok: true, id: data.id };
}

/**
 * Affecte (ou retire) un responsable à une classe (administrateur uniquement).
 */
export async function updateClassResponsable(
  classId: string,
  responsableId: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("classes")
    .update({ responsable: responsableId ?? null })
    .eq("id", classId);

  if (error) {
    return { ok: false, error: translateDbError(error) };
  }
  return { ok: true };
}

/**
 * Affecte (ou retire) un responsable à un cours (administrateur uniquement).
 */
export async function updateCourseResponsable(
  courseId: string,
  responsableId: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase
    .from("courses")
    .update({ responsable: responsableId ?? null })
    .eq("id", courseId);

  if (error) {
    return { ok: false, error: translateDbError(error) };
  }
  return { ok: true };
}

