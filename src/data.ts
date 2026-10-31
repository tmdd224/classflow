import { LayoutDashboard } from "lucide-react";
import type {
  DocumentItem,
  PageKey,
  Role,
  User,
  Classe,
} from "./types";

export const navigation: {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}[] = [
  { key: "overview", label: "Vue d’ensemble", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "courses", label: "Mes cours", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "documents", label: "Documents", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "upload", label: "Déposer un fichier", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "validation", label: "Validations", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "administration", label: "Administration", icon: LayoutDashboard, roles: ["administrateur"] },
];

export const documents: DocumentItem[] = [
  {
    name: "Introduction au Big Data",
    type: "PDF",
    course: "Big Data",
    date: "Aujourd’hui",
    size: "2,4 Mo",
    color: "violet",
  },
  {
    name: "Exercices Python",
    type: "DOCX",
    course: "Développement",
    date: "Hier",
    size: "840 Ko",
    color: "blue",
  },
  {
    name: "Cours Intelligence Artificielle",
    type: "PDF",
    course: "Intelligence artificielle",
    date: "28 oct. 2026",
    size: "3,1 Mo",
    color: "orange",
  },
];

export const allDocuments: DocumentItem[] = [
  ...documents,
  {
    name: "Introduction à l'intelligence artificielle",
    type: "PDF",
    course: "Intelligence artificielle",
    date: "30 octobre 2026",
    size: "2,1 Mo",
    color: "violet",
  },
  {
    name: "Les algorithmes de Machine Learning",
    type: "PDF",
    course: "Intelligence artificielle",
    date: "28 octobre 2026",
    size: "1,8 Mo",
    color: "violet",
  },
  {
    name: "Architecture Hadoop",
    type: "PDF",
    course: "Big Data",
    date: "28 octobre 2026",
    size: "2,7 Mo",
    color: "blue",
  },
  {
    name: "Apache Hive et SQL",
    type: "PPTX",
    course: "Big Data",
    date: "25 octobre 2026",
    size: "4,2 Mo",
    color: "blue",
  },
  {
    name: "Introduction à React",
    type: "PDF",
    course: "Développement",
    date: "24 octobre 2026",
    size: "1,5 Mo",
    color: "orange",
  },
  {
    name: "Travaux pratiques HTML et CSS",
    type: "DOCX",
    course: "Développement",
    date: "22 octobre 2026",
    size: "950 Ko",
    color: "orange",
  },
];

export const courses = [
  {
    name: "Intelligence artificielle",
    code: "IA · L3",
    progress: 72,
    resources: 14,
    color: "purple",
    initials: "IA",
    responsable: "Fatoumata Sy",
  },
  {
    name: "Big Data",
    code: "BD · L3",
    progress: 58,
    resources: 12,
    color: "blue",
    initials: "BD",
    responsable: "Moustapha Ba",
  },
  {
    name: "Développement Web",
    code: "DEV · L3",
    progress: 84,
    resources: 9,
    color: "orange",
    initials: "DW",
    responsable: "Moustapha Ba",
  },
];

export const users: User[] = [
  {
    id: "U1",
    name: "Thierno Diallo",
    email: "thierno.diallo@ism.sn",
    role: "etudiant",
    classe: "L3 IA",
    status: "actif",
  },
  {
    id: "U2",
    name: "Aïssatou Ndiaye",
    email: "aissatou.ndiaye@ism.sn",
    role: "etudiant",
    classe: "L3 IA",
    status: "actif",
  },
  {
    id: "U3",
    name: "Cheikh Touré",
    email: "cheikh.toure@ism.sn",
    role: "etudiant",
    classe: "L3 Big Data",
    status: "inactif",
  },
  {
    id: "U4",
    name: "Fatoumata Sy",
    email: "fatoumata.sy@ism.sn",
    role: "responsable",
    classe: "Intelligence artificielle",
    status: "actif",
  },
  {
    id: "U5",
    name: "Moustapha Ba",
    email: "moustapha.ba@ism.sn",
    role: "responsable",
    classe: "Développement Web",
    status: "actif",
  },
  {
    id: "U6",
    name: "Admin ClassFlow",
    email: "admin@classflow.sn",
    role: "administrateur",
    status: "actif",
  },
];

export const classes: Classe[] = [
  {
    id: "C1",
    name: "Licence 3 Intelligence Artificielle",
    niveau: "L3",
    effectif: 42,
    responsable: "Fatoumata Sy",
  },
  {
    id: "C2",
    name: "Licence 3 Big Data",
    niveau: "L3",
    effectif: 38,
    responsable: "Moustapha Ba",
  },
  {
    id: "C3",
    name: "Licence 3 Développement Web",
    niveau: "L3",
    effectif: 45,
    responsable: "Moustapha Ba",
  },
  {
    id: "C4",
    name: "Master 1 Science des Données",
    niveau: "M1",
    effectif: 28,
  },
];

export const courseResources: Record<
  string,
  { name: string; type: string; date: string }[]
> = {
  "IA · L3": [
    { name: "Introduction à l'intelligence artificielle", type: "PDF", date: "30 octobre 2026" },
    { name: "Les algorithmes de Machine Learning", type: "PDF", date: "28 octobre 2026" },
    { name: "Exercices sur le KNN", type: "DOCX", date: "25 octobre 2026" },
  ],
  "BD · L3": [
    { name: "Introduction au Big Data", type: "PDF", date: "30 octobre 2026" },
    { name: "Architecture Hadoop", type: "PDF", date: "28 octobre 2026" },
    { name: "Apache Hive et SQL", type: "PPTX", date: "25 octobre 2026" },
  ],
  "DEV · L3": [
    { name: "Introduction à React", type: "PDF", date: "30 octobre 2026" },
    { name: "JavaScript : les fondamentaux", type: "PDF", date: "28 octobre 2026" },
    { name: "Travaux pratiques HTML et CSS", type: "DOCX", date: "25 octobre 2026" },
  ],
};

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
