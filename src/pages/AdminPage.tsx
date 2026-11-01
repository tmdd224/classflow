import {
  Clock3,
  FileText,
  Plus,
  ShieldCheck,
  ToggleRight,
  ToggleLeft,
  Users,
  Save,
  X as XIcon,
} from "lucide-react";
import { useState } from "react";
import { StatCard } from "../components/StatCard";
import type { DocumentItem, User, Classe, Course } from "../types";
import { roleLabels } from "../types";
import {
  toggleUserActive,
  createClass,
  updateClassResponsable,
  updateCourseResponsable,
} from "../lib/supabase";

export function AdminPage({
  users,
  classes,
  courses,
  documents,
}: {
  users: User[];
  classes: Classe[];
  courses: Course[];
  documents: DocumentItem[];
}) {
  const totalDocuments = documents.length;

  const pending = documents.filter(
    (doc) => !doc.status || doc.status === "pending"
  ).length;

  const approved = documents.filter(
    (doc) => doc.status === "approved"
  ).length;

  const rejected = documents.filter(
    (doc) => doc.status === "rejected"
  ).length;

  const etudiants = users.filter((u) => u.role === "etudiant").length;
  const responsables = users.filter((u) => u.role === "responsable").length;

  const responsablesList = users.filter(
    (u) => u.role === "responsable" || u.role === "administrateur"
  );

  const [newClassName, setNewClassName] = useState("");
  const [newClassNiveau, setNewClassNiveau] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);
  const [classResponsable, setClassResponsable] = useState<Record<string, string>>({});
  const [courseResponsable, setCourseResponsable] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function clearMessage() {
    setMessage(null);
  }

  async function handleToggleUser(user: User) {
    const newActive = user.status !== "actif";
    setSaving({ ...saving, [user.id]: true });
    clearMessage();
    const result = await toggleUserActive(user.id, newActive);
    setSaving({ ...saving, [user.id]: false });
    if (!result.ok) {
      setMessage({ text: (result as { ok: false; error: string }).error, type: "error" });
      return;
    }
    setMessage({ text: `Compte ${newActive ? "activé" : "désactivé"} avec succès.`, type: "success" });
  }

  async function handleCreateClass() {
    if (!newClassName.trim() || !newClassNiveau.trim()) {
      setMessage({ text: "Nom et niveau requis.", type: "error" });
      return;
    }
    setCreatingClass(true);
    clearMessage();
    const result = await createClass(newClassName.trim(), newClassNiveau.trim(), null);
    setCreatingClass(false);
    if (!result.ok) {
      setMessage({ text: (result as { ok: false; error: string }).error, type: "error" });
      return;
    }
    setNewClassName("");
    setNewClassNiveau("");
    setMessage({ text: "Classe créée avec succès.", type: "success" });
  }

  async function handleSaveClassResponsable(classId: string) {
    const respId = classResponsable[classId] || null;
    setSaving({ ...saving, [classId]: true });
    clearMessage();
    const result = await updateClassResponsable(classId, respId);
    setSaving({ ...saving, [classId]: false });
    if (!result.ok) {
      setMessage({ text: (result as { ok: false; error: string }).error, type: "error" });
      return;
    }
    setMessage({ text: "Responsable de classe mis à jour.", type: "success" });
  }

  async function handleSaveCourseResponsable(courseId: string) {
    const respId = courseResponsable[courseId] || null;
    setSaving({ ...saving, [courseId]: true });
    clearMessage();
    const result = await updateCourseResponsable(courseId, respId);
    setSaving({ ...saving, [courseId]: false });
    if (!result.ok) {
      setMessage({ text: (result as { ok: false; error: string }).error, type: "error" });
      return;
    }
    setMessage({ text: "Responsable de cours mis à jour.", type: "success" });
  }

  return (
    <div className="admin-page">
      {message && (
        <div
          className={`admin-message admin-message-${message.type}`}
          role="alert"
          onClick={clearMessage}
        >
          {message.text}
        </div>
      )}

      <div className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-text">
            <div className="eyebrow">
              <span className="live-dot" /> ADMINISTRATION
            </div>
            <h1>Tableau de bord</h1>
            <p className="page-subtitle">
              Gestion des utilisateurs, des classes et des cours.
            </p>
          </div>
          <div className="admin-hero-stats">
            <div className="admin-stat-mini">
              <div className="label">Utilisateurs</div>
              <div className="value">{users.length}</div>
            </div>
            <div className="admin-stat-mini">
              <div className="label">Classes</div>
              <div className="value">{classes.length}</div>
            </div>
            <div className="admin-stat-mini">
              <div className="label">Cours</div>
              <div className="value">{courses.length}</div>
            </div>
          </div>
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
          note="Validés"
          tone="green"
        />

        <StatCard
          icon={<Clock3 />}
          label="Refusés"
          value={String(rejected).padStart(2, "0")}
          note="Refusés"
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

      <section className="panel admin-panel admin-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">UTILISATEURS</span>
            <h3>Utilisateurs de la plateforme</h3>
          </div>
          <div className="admin-actions" />
        </div>

        <div className="document-table admin-users">
          <div className="document-head">
            <span>NOM</span>
            <span>EMAIL</span>
            <span>RÔLE</span>
            <span>CLASSE</span>
            <span>STATUT</span>
            <span />
          </div>

          {users.map((user: User) => (
            <div className="document-row admin-row" key={user.id}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span>{roleLabels[user.role]}</span>
              <span>{user.classe ?? "—"}</span>
              <span className={`status-badge ${user.status === "actif" ? "status-active" : "status-inactive"}`}>
                {user.status === "actif" ? "Actif" : "Inactif"}
              </span>
              <button
                className={`text-button ${saving[user.id] ? "saving" : ""}`}
                onClick={() => handleToggleUser(user)}
                disabled={saving[user.id]}
                aria-label={user.status === "actif" ? "Désactiver le compte" : "Activer le compte"}
              >
                {saving[user.id] ? (
                  <Save size={14} />
                ) : user.status === "actif" ? (
                  <ToggleLeft size={14} />
                ) : (
                  <ToggleRight size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel admin-panel admin-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">CLASSES</span>
            <h3>Classes et effectifs</h3>
          </div>

          {creatingClass ? (
            <div className="admin-actions creating admin-create-form">
              <input
                className="admin-input admin-input-premium"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Nom de la classe"
                autoFocus
              />
              <input
                className="admin-input admin-input-premium"
                value={newClassNiveau}
                onChange={(e) => setNewClassNiveau(e.target.value)}
                placeholder="Niveau (ex: L3, M1...)"
              />
              <button
                className="primary-button"
                onClick={handleCreateClass}
                disabled={!newClassName.trim() || !newClassNiveau.trim()}
              >
                Créer
              </button>
              <button className="text-button" onClick={() => setCreatingClass(false)}>
                <XIcon size={14} /> Annuler
              </button>
            </div>
          ) : (
            <div className="admin-actions">
              <button className="primary-button" onClick={() => setCreatingClass(true)}>
                <Plus size={14} /> Créer une classe
              </button>
            </div>
          )}
        </div>

        <div className="document-table admin-classes">
          <div className="document-head">
            <span>CLASSE</span>
            <span>NIVEAU</span>
            <span>EFFECTIF</span>
            <span>RESPONSABLE</span>
            <span />
          </div>

          {classes.map((classe: Classe) => {
            const currentResp = classe.responsable ?? "";
            const isSaving = saving[classe.id];
            return (
              <div className="document-row admin-row" key={classe.id}>
                <strong>{classe.name}</strong>
                <span>{classe.niveau}</span>
                <span>{classe.effectif}</span>
                <div className="responsable-cell">
                  <div className="responsable-select-wrap">
                    <select
                      value={classResponsable[classe.id] ?? currentResp}
                    onChange={(e) => setClassResponsable({ ...classResponsable, [classe.id]: e.target.value })}
                    disabled={isSaving}
                  >
                    <option value="">— Aucun —</option>
                    {responsablesList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                    </div>
                  {isSaving ? (
                    <Save size={14} />
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => handleSaveClassResponsable(classe.id)}
                      title="Enregistrer"
                    >
                      <Save size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel admin-panel admin-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">COURS</span>
            <h3>Cours et responsables affectés</h3>
          </div>
          <div className="admin-actions" />
        </div>

        <div className="document-table admin-courses">
          <div className="document-head">
            <span>NOM</span>
            <span>CODE</span>
            <span>RESPONSABLE</span>
            <span>PROGRESSION</span>
            <span>RESSOURCES</span>
            <span />
          </div>

          {courses.map((course: Course) => {
            const currentResp = course.responsable ?? "";
            const isSaving = saving[course.code];
            return (
              <div className="document-row admin-row" key={course.code}>
                <strong>{course.name}</strong>
                <span>{course.code}</span>
                <div className="responsable-cell">
                  <div className="responsable-select-wrap">
                    <select
                      value={courseResponsable[course.code] ?? currentResp}
                    onChange={(e) => setCourseResponsable({ ...courseResponsable, [course.code]: e.target.value })}
                    disabled={isSaving}
                  >
                    <option value="">— Aucun —</option>
                    {responsablesList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                    </div>
                  {isSaving ? (
                    <Save size={14} />
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => handleSaveCourseResponsable(course.code)}
                      title="Enregistrer"
                    >
                      <Save size={14} />
                    </button>
                  )}
                </div>
                <span>{course.progress}%</span>
                <span>{course.resources}</span>
              </div>
          )})}
        </div>
      </section>
    </div>
  );
}
