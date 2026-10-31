import {
  CloudUpload,
  FileText,
  FolderOpen,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { formatFileSize } from "../data";

export function UploadPage({
  onUpload,
  onCancel,
}: {
  onUpload: (file: File, course: string, description: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("Big Data");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx", "pptx"].includes(extension ?? "")) {
      setError(
        "Format non accepté. Choisis un fichier PDF, DOCX ou PPTX."
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Le fichier dépasse la limite de 20 Mo.");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      validateFile(file);
    }
  }

  function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Sélectionne d'abord un fichier.");
      return;
    }

    onUpload(selectedFile, selectedCourse, description.trim());
  }

  return (
    <div className="upload-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> PARTAGE DE RESSOURCES
          </div>

          <h1>Déposer un fichier</h1>

          <p className="page-subtitle">
            Ajoute un support de cours à ta bibliothèque ClassFlow.
          </p>
        </div>
      </div>

      <form className="panel upload-form" onSubmit={submitUpload}>
        <div className="section-heading">
          <div>
            <span className="section-kicker">NOUVEAU DOCUMENT</span>
            <h3>Informations du fichier</h3>
          </div>
        </div>

        <div
          className={`upload-dropzone ${isDragging ? "dragging" : ""} ${
            selectedFile ? "has-file" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.pptx"
            className="upload-file-input"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                validateFile(file);
              }
            }}
          />

          {selectedFile ? (
            <>
              <div className="upload-selected-icon">
                <FileText size={30} />
              </div>

              <strong>{selectedFile.name}</strong>

              <span>
                {formatFileSize(selectedFile.size)} · Fichier prêt à être
                déposé
              </span>

              <button
                type="button"
                className="upload-change-button"
                onClick={() => {
                  setSelectedFile(null);

                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
              >
                <X size={15} /> Retirer le fichier
              </button>
            </>
          ) : (
            <>
              <div className="upload-cloud-icon">
                <CloudUpload size={34} />
              </div>

              <strong>Glisse ton document ici</strong>

              <span>
                ou sélectionne un fichier depuis ton ordinateur
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={() => inputRef.current?.click()}
              >
                <FolderOpen size={17} /> Choisir un fichier
              </button>

              <small>
                Formats acceptés : PDF, DOCX, PPTX · 20 Mo maximum
              </small>
            </>
          )}
        </div>

        {error && <p className="upload-error">{error}</p>}

        <div className="upload-fields">
          <div className="upload-field">
            <label htmlFor="upload-course">Cours associé</label>

            <select
              id="upload-course"
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
            >
              <option value="Big Data">Big Data</option>
              <option value="Intelligence artificielle">
                Intelligence artificielle
              </option>
              <option value="Développement">Développement Web</option>
            </select>
          </div>

          <div className="upload-field">
            <label htmlFor="upload-description">
              Description (facultatif)
            </label>

            <textarea
              id="upload-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Exemple : Support du cours de Big Data sur Apache Hive..."
              rows={4}
            />
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="reset-filters"
            onClick={onCancel}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={!selectedFile}
          >
            <CloudUpload size={17} /> Déposer le document
          </button>
        </div>
      </form>

      <div className="upload-information">
        <ShieldCheck size={19} />

        <p>
          Vérifie que ton document est lisible et qu'il correspond au cours
          sélectionné avant de le partager.
        </p>
      </div>
    </div>
  );
}
