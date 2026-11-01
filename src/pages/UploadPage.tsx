import { useState, useRef } from "react";
import { CloudUpload, CheckCircle2, FileText, AlertCircle, RefreshCw } from "lucide-react";
import type { Course } from "../types";
import {
  validateFile,
  uploadDocumentToStorage,
  insertDocument,
  buildStoragePath,
  mimeTypeFromExtension,
} from "../lib/supabase";
import { formatFileSize } from "../data";

type FileStatus = "idle" | "uploading" | "success" | "error";

interface UploadFileEntry {
  id: string;
  file: File;
  status: FileStatus;
  error: string | null;
  storagePath: string | null;
}

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
  const [uploads, setUploads] = useState<UploadFileEntry[]>([]);
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const hasFiles = uploads.length > 0;
  const hasPending = uploads.some(
    (u) => u.status === "idle" || u.status === "uploading"
  );
  const hasErrors = uploads.some((u) => u.status === "error");

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    addFiles(files);
    event.target.value = "";
  }

  function addFiles(files: File[]) {
    setGlobalError(null);

    const newEntries: UploadFileEntry[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "idle",
      error: null,
      storagePath: null,
    }));

    // Validate each file immediately
    const validated = newEntries.map((entry) => {
      const validation = validateFile(entry.file);
      if (!validation.ok) {
        return { ...entry, status: "error", error: validation.error };
      }
      return entry;
    });

    setUploads((prev) => [...prev, ...validated]);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);

    const files = Array.from(event.dataTransfer.files ?? []);
    addFiles(files);
  }

  function handleRemove(id: string) {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }

  function handleRetry(id: string) {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: "idle", error: null, storagePath: null }
          : u
      )
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError(null);

    if (!course) {
      setGlobalError("Sélectionnez un cours de destination.");
      return;
    }

    const toUpload = uploads.filter(
      (u) => u.status === "idle" || u.status === "error"
    );

    if (toUpload.length === 0) {
      setGlobalError("Aucun fichier à déposer.");
      return;
    }

    const courseRecord = courses.find((c) => c.name === course);
    const courseId = courseRecord?.id ?? null;

    setSubmitting(true);

    // Traite chaque fichier de maniere independente, un apres l'autre
    for (const entry of toUpload) {
      await processFile(entry, courseId, description);
    }

    setSubmitting(false);
    onUploadComplete();
  }

  async function processFile(
    entry: UploadFileEntry,
    courseId: string | null,
    description: string
  ): Promise<void> {
    const extension = entry.file.name.split(".").pop()?.toLowerCase() ?? "";
    const storagePath = buildStoragePath(classId, courseId ?? "", extension);

    setUploads((prev) =>
      prev.map((u) => (u.id === entry.id ? { ...u, status: "uploading" } : u))
    );

    // Etape 1 : envoi dans le stockage. L'insertion en base n'intervient
    // qu'apres une reussite de l'upload.
    const uploadResult = await uploadDocumentToStorage(
      entry.file,
      storagePath,
      mimeTypeFromExtension(extension) ?? entry.file.type
    );

    if (!uploadResult.ok) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === entry.id
            ? { ...u, status: "error", error: uploadResult.error }
            : u
        )
      );
      return;
    }

    // Etape 2 : insertion en base uniquement si l'upload a reussi.
    const insertResult = await insertDocument({
      title: entry.file.name.replace(/\.[^/.]+$/, ""),
      file_name: entry.file.name,
      storage_path: storagePath,
      mime_type: mimeTypeFromExtension(extension) ?? entry.file.type,
      size_bytes: entry.file.size,
      description: description || null,
      course_id: courseId,
      uploaded_by: userId,
    });

    if (!insertResult.ok) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === entry.id
            ? { ...u, status: "error", error: insertResult.error }
            : u
        )
      );
      return;
    }

    setUploads((prev) =>
      prev.map((u) => (u.id === entry.id ? { ...u, status: "success" } : u))
    );
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);
  }

  const acceptedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".zip",
    ".ipynb",
  ].join(",");

  return (
    <div className="upload-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> DEPOT DE DOCUMENTS
          </div>

          <h1>Deposer des documents</h1>

          <p className="page-subtitle">
            Selectionnez un ou plusieurs fichiers, choisissez le cours de
            destination et envoyez vos depots pour validation.
          </p>

          {globalError && <div className="upload-error">{globalError}</div>}
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div
          className={`upload-dropzone ${dragActive ? "dragging" : ""} ${hasFiles ? "has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="upload-file-input"
            multiple
            accept={acceptedExtensions}
            onChange={handleFileChange}
          />

          {hasFiles ? (
            <>
              <div className="upload-list">
                {uploads.map((entry) => (
                  <div
                    key={entry.id}
                    className={`upload-item ${entry.status}`}
                  >
                    <div className="upload-item-icon">
                      <FileText size={16} />
                    </div>

                    <div className="upload-item-info">
                      <strong>{entry.file.name}</strong>
                      <span>
                        {formatFileSize(entry.file.size)} ·
                        {entry.file.type || "type inconnu"}
                      </span>
                    </div>

                    <div className="upload-item-status">
                      {entry.status === "error" ? (
                        <>
                          <AlertCircle size={14} />
                          <span className="upload-error">{entry.error}</span>
                        </>
                      ) : entry.status === "success" ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Depose</span>
                        </>
                      ) : entry.status === "uploading" ? (
                        <>
                          <div className="upload-progress-bar" />
                          <span>Envoi…</span>
                        </>
                      ) : (
                        <span>En attente</span>
                      )}
                    </div>

                    {entry.status === "error" && (
                      <button
                        type="button"
                        className="upload-retry"
                        onClick={() => handleRetry(entry.id)}
                      >
                        <RefreshCw size={14} /> Reessayer
                      </button>
                    )}

                    <button
                      type="button"
                      className="upload-remove"
                      onClick={() => handleRemove(entry.id)}
                      aria-label="Supprimer ce fichier"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="upload-cloud-icon">
                <CloudUpload size={28} />
              </div>

              <strong>Choisir des fichiers</strong>
              <span>
                Glissez-deposez ou cliquez pour selectionner plusieurs fichiers
              </span>
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
              disabled={submitting}
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
              placeholder="Precisez le contenu de ces depots…"
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="text-button"
            onClick={onCancel}
            disabled={submitting || !hasFiles}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={
              !course ||
              !hasFiles ||
              submitting ||
              uploads.every((u) => u.status === "success" || u.status === "error")
            }
          >
            {submitting ? "Depot en cours…" : "Deposer les fichiers"}
          </button>
        </div>
      </form>

      {hasFiles && (
        <div className="upload-information">
          <p>
            Chaque fichier sera examine par l'equipe pedagogique avant
            publication. Vous recevrez une notification une fois valide.
          </p>
          <p>
            Formats accepts : PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV, TXT,
            PNG, JPG, JPEG, ZIP, IPYNB. Taille maximale : 20 Mo par fichier.
          </p>
          {hasErrors && (
            <p className="upload-error">
              Certains fichiers presentent des erreurs. Corrigez-les avant de
              deposer.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
