import { useState, useRef } from "react";
import { CloudUpload, CheckCircle2 } from "lucide-react";
import type { Course } from "../types";
import {
  validateFile,
  uploadDocumentToStorage,
  insertDocument,
  buildStoragePath,
} from "../lib/supabase";

export function UploadPage({
  courses,
  userId,
  classId,
  onUploadComplete,
  onCancel,
}: {
  courses: Course[];
  userId: string;
  classId: string | null;
  onUploadComplete: () => void;
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    // Permet de resélectionner le même fichier à nouveau
    event.target.value = "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file || !course) {
      setError("Sélectionnez un fichier et un cours.");
      return;
    }

    const validation = validateFile(file);
    if (!validation.ok) {
      setError((validation as { error: string }).error);
      return;
    }

    const courseRecord = courses.find((c) => c.name === course);
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const storagePath = buildStoragePath(
      courseRecord?.class_id ?? classId,
      courseRecord?.id ?? "",
      extension
    );

    setUploading(true);

    uploadDocumentToStorage(file, storagePath, validation.mime_type)
      .then(() =>
        insertDocument({
          title: file.name.replace(/\.[^/.]+$/, ""),
          file_name: file.name,
          storage_path: storagePath,
          mime_type: validation.mime_type,
          size_bytes: file.size,
          description: description || null,
          course_id: courseRecord?.id ?? null,
          uploaded_by: userId,
        })
      )
      .then(() => {
        setUploading(false);
        onUploadComplete();
      })
      .catch((err) => {
        setUploading(false);
        setError(
          err instanceof Error
            ? `Erreur inattendue : ${err.message}`
            : "Erreur inattendue lors du dépôt."
        );
        // Le fichier n'est pas supprimé : la purge se fera côté serveur
      });
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
      setError(null);
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

          {error && (
            <div className="upload-error">{error}</div>
          )}
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
            accept=".pdf,.docx,.pptx"
            onChange={handleFileChange}
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
                onClick={(event) => {
                  event.stopPropagation();
                  setFile(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
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
              {[1, 2].map((sem) => {
                const semCourses = courses.filter((c) => c.semester === sem);
                if (semCourses.length === 0) return null;
                return (
                  <optgroup key={sem} label={`Semestre ${sem}`}>
                    {semCourses.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
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
          <button
            type="button"
            className="text-button"
            onClick={onCancel}
            disabled={uploading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={!file || !course || uploading}
          >
            {uploading ? "Dépôt en cours…" : "Déposer le document"}
          </button>
        </div>
      </form>

      <div className="upload-information">
        <p>
          Votre document sera examiné par l'équipe pédagogique avant
          publication. Vous recevrez une notification une fois validé.
        </p>
        <p>
          Formats acceptés : PDF, DOCX, PPTX. Taille maximale : 20 Mo.
        </p>
      </div>
    </div>
  );
}
