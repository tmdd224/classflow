import { useState, useRef } from "react";
import { CloudUpload, CheckCircle2, ArrowRight } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

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

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);

    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (dropped) {
      setFile(dropped);
    }
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

      <form className="upload-form" onSubmit={handleSubmit}>
        <div
          className={`upload-dropzone ${dragActive ? "dragging" : ""} ${file ? "has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="upload-file-input"
            accept=".pdf,.doc,.docx"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
            }}
          />

          {file ? (
            <>
              <div className="upload-selected-icon">
                <CheckCircle2 size={28} />
              </div>

              <strong>{file.name}</strong>
              <span>{file.type}</span>

              <button
                type="button"
                className="upload-change-button"
                onClick={() => setFile(null)}
              >
                Changer de fichier
              </button>
            </>
          ) : (
            <>
              <div className="upload-cloud-icon">
                <CloudUpload size={28} />
              </div>

              <strong>Choisir un fichier</strong>
              <span>Glissez-déposez ou cliquez pour sélectionner</span>
            </>
          )}
        </div>

        <div className="upload-fields">
          <div className="upload-field">
            <label>Cours de destination</label>
            <select
              className="upload-field select"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
            >
              <option value="">Sélectionner un cours</option>
              {courses.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="upload-field">
            <label>Description</label>
            <textarea
              className="upload-field textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Précisez le contenu de ce dépôt…"
              rows={3}
            />
          </div>
        </div>

        <div className="upload-actions">
          <button type="button" className="text-button" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={!file || !course}
          >
            Déposer le document <ArrowRight size={15} />
          </button>
        </div>
      </form>

      <div className="upload-information">
        <p>
          Votre document sera examiné par l'équipe pédagogique avant
          publication. Vous recevrez une notification une fois validé.
        </p>
      </div>
    </div>
  );
}
