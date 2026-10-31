import { useState } from "react";
import type { Course } from "../types";

export function UploadPage({
  courses,
  onUpload,
  onCancel,
}: {
  courses: Course[];
  onUpload: (file: File, course: string, description: string) => void;
  onCancel: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || !course) {
      return;
    }

    onUpload(file, course, description);
    setFile(null);
    setCourse("");
    setDescription("");
  }

  return (
    <div className="upload-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> DÉPÔT DE DOCUMENT
          </div>

          <h1>Déposer un document</h1>

          <p className="page-subtitle">
            Sélectionnez un fichier, choisissez le cours de destination et
            envoyez votre dépôt pour validation.
          </p>
        </div>
      </div>

      <form className="panel upload-panel" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Fichier</label>
          <input
            type="file"
            className="form-file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cours de destination</label>
          <select
            className="form-select"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
          >
            <option value="">Sélectionner un cours</option>
            {courses.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Précisez le contenu de ce dépôt…"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={!file || !course}
          >
            Déposer le document
          </button>
        </div>

        <p className="form-note">
          Votre document sera examiné par l'équipe pédagogique avant
          publication. Vous recevrez une notification une fois validé.
        </p>
      </form>
    </div>
  );
}
