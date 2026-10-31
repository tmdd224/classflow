import {
  Clock3,
  Edit3,
  FileText,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { documents, users, classes, courses } from "../data";
import { StatCard } from "../components/StatCard";
import type { DocumentItem, User, Classe, Course } from "../types";
import { roleLabels } from "../types";

interface AdminPageProps {
  uploadedDocuments: DocumentItem[];
}

export function AdminPage({ uploadedDocuments }: AdminPageProps) {
  const totalDocuments = uploadedDocuments.length + documents.length;

  const pending = uploadedDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  ).length;

  const approved = uploadedDocuments.filter(
    (doc) => doc.status === "approved"
  ).length;

  const rejected = uploadedDocuments.filter(
    (doc) => doc.status === "rejected"
  ).length;

  const etudiants = users.filter((u) => u.role === "etudiant").length;
  const responsables = users.filter((u) => u.role === "responsable").length;

  const disabledActions = (
    <>
      <div className="admin-buttons">
        <button className="primary-button" disabled>
          <Plus size={15} /> Ajouter
        </button>
        <button className="text-button" disabled>
          <Edit3 size={15} /> Modifier
        </button>
      </div>
      <span className="admin-locked">
        Disponible après l'authentification et la base de données
      </span>
    </>
  );

  return (
    <div className="admin-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> ADMINISTRATION
          </div>

          <h1>Tableau de bord</h1>

          <p className="page-subtitle">
            Vue globale de la plateforme ClassFlow (données de démonstration).
          </p>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard
          icon={<FileText />}
          label="Documents au total"
          value={String(totalDocuments)}
          note="Dépôts et démonstration"
          tone="purple"
        />

        <StatCard
          icon={<Clock3 />}
          label="En attente"
          value={String(pending).padStart(2, "0")}
          note="À examiner"
          tone="orange"
        />

        <StatCard
          icon={<ShieldCheck />}
          label="Validés"
          value={String(approved).padStart(2, "0")}
          note="Publiés"
          tone="green"
        />

        <StatCard
          icon={<Clock3 />}
          label="Refusés"
          value={String(rejected).padStart(2, "0")}
          note="Rejetés"
          tone="red"
        />

        <StatCard
          icon={<Users />}
          label="Utilisateurs"
          value={String(users.length)}
          note={`${etudiants} étudiants · ${responsables} responsables`}
          tone="blue"
        />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">UTILISATEURS</span>
            <h3>Utilisateurs de la plateforme</h3>
          </div>

          <div className="admin-actions">{disabledActions}</div>
        </div>

        <div className="document-table admin-users">
          <div className="document-head">
            <span>NOM</span>
            <span>EMAIL</span>
            <span>RÔLE</span>
            <span>CLASSE</span>
            <span>STATUT</span>
          </div>

          {users.map((user: User) => (
            <div className="document-row" key={user.id}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span>{roleLabels[user.role]}</span>
              <span>{user.classe ?? "—"}</span>
              <span>{user.status === "actif" ? "Actif" : "Inactif"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">CLASSES</span>
            <h3>Classes et effectifs</h3>
          </div>

          <div className="admin-actions">{disabledActions}</div>
        </div>

        <div className="document-table admin-classes">
          <div className="document-head">
            <span>CLASSE</span>
            <span>NIVEAU</span>
            <span>EFFECTIF</span>
            <span>RESPONSABLE</span>
          </div>

          {classes.map((classe: Classe) => (
            <div className="document-row" key={classe.id}>
              <strong>{classe.name}</strong>
              <span>{classe.niveau}</span>
              <span>{classe.effectif}</span>
              <span>{classe.responsable ?? "—"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">COURS</span>
            <h3>Cours et responsables affectés</h3>
          </div>

          <div className="admin-actions">{disabledActions}</div>
        </div>

        <div className="document-table admin-courses">
          <div className="document-head">
            <span>NOM</span>
            <span>CODE</span>
            <span>RESPONSABLE</span>
            <span>PROGRESSION</span>
            <span>RESSOURCES</span>
          </div>

          {courses.map((course: Course) => (
            <div className="document-row" key={course.code}>
              <strong>{course.name}</strong>
              <span>{course.code}</span>
              <span>{course.responsable ?? "—"}</span>
              <span>{course.progress}%</span>
              <span>{course.resources}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
