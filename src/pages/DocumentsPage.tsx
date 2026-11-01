import { FileText } from "lucide-react";
import { useState } from "react";
import type { Course, DocumentItem } from "../types";
import {
  getDocumentSignedUrl,
  formatDateFR,
  typeLabelFromMimeType,
  translateDbError,
} from "../lib/supabase";

export function DocumentsPage({
  documents,
  courses,
  query,
}: {
  documents: DocumentItem[];
  courses: Course[];
  query: string;
}) {
  const search = query.toLowerCase().trim();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const courseById = new Map(courses.map((c) => [c.id, c.name]));

  const library = [...documents];

  const filtered = library.filter((doc) => {
    const matchesSearch = search
      ? doc.name.toLowerCase().includes(search)
      : true;
    return matchesSearch;
  });

  async function handleDownload(doc: DocumentItem) {
    setDownloadError(null);
    const result = await getDocumentSignedUrl(doc.storage_path);
    if (!result.ok) {
      setDownloadError(
        result.error.includes("introuvable") ||
          result.error.includes("not found")
          ? "Fichier introuvable dans le stockage."
          : result.error
      );
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div className="documents-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> DOCUMENTS PÉDAGOGIQUES
          </div>

          <h1>Bibliothèque</h1>

          <p className="page-subtitle">
            Tous vos documents de cours et vos dépôts personnels.
          </p>
        </div>
      </div>

      {downloadError && (
        <div className="upload-error" style={{ marginBottom: 16 }}>
          {downloadError}
        </div>
      )}

      <section className="panel documents-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RESSOURCES DISPONIBLES</span>
            <h3>
              {filtered.length} document{filtered.length > 1 ? "s" : ""}
            </h3>
          </div>
        </div>

        <div className="document-table">
          <div className="document-head">
            <span>NOM DU DOCUMENT</span>
            <span>TYPE</span>
            <span>COURS</span>
            <span>STATUT</span>
            <span>DATE / TAILLE</span>
            <span />
          </div>
          {filtered.map((doc) => {
            const courseName =
              doc.courseId !== undefined
                ? courseById.get(doc.courseId) ?? "Cours inconnu"
                : "—";
            return (
              <div className="document-row" key={doc.id}>
                <div className="document-name">
                  <div className={`file-icon ${doc.color}`}>
                    <FileText size={18} />
                  </div>

                  <strong>{doc.name}</strong>
                </div>

                <span className="document-course">
                  {typeLabelFromMimeType(doc.mime_type)}
                </span>
                <span className="document-course">{courseName}</span>
                <span
                  className={`document-status ${
                    doc.status === "approved"
                      ? "approved"
                      : doc.status === "rejected"
                        ? "rejected"
                        : "pending"
                  }`}
                >
                  {doc.status === "approved"
                    ? "Validé"
                    : doc.status === "rejected"
                      ? "Refusé"
                      : "En attente"}
                </span>
                <span className="document-date">
                  {formatDateFR(doc.date)} · {doc.size}
                </span>

                <button
                  className="download-button"
                  onClick={() => handleDownload(doc)}
                  title="Télécharger"
                >
                  <span>↓</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {documents.length > 0 && (
        <section className="panel documents-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">RESSOURCES DE LA BASE</span>
              <h3>
                {documents.length} document{documents.length > 1 ? "s" : ""}
                disponible{documents.length > 1 ? "s" : ""}
              </h3>
            </div>
          </div>

          <div className="document-table">
            <div className="document-head">
              <span>NOM DU DOCUMENT</span>
              <span>TYPE</span>
              <span>COURS</span>
              <span>STATUT</span>
              <span>DATE / TAILLE</span>
              <span />
            </div>
            {documents.map((doc) => {
              const courseName =
                doc.courseId !== undefined
                  ? courseById.get(doc.courseId) ?? "Cours inconnu"
                  : "—";
              return (
                <div className="document-row" key={doc.id}>
                  <div className="document-name">
                    <div className={`file-icon ${doc.color}`}>
                      <FileText size={18} />
                    </div>

                    <strong>{doc.name}</strong>
                  </div>

                  <span className="document-course">
                    {typeLabelFromMimeType(doc.mime_type)}
                  </span>
                  <span className="document-course">{courseName}</span>
                  <span
                    className={`document-status ${
                      doc.status === "approved"
                        ? "approved"
                        : doc.status === "rejected"
                          ? "rejected"
                          : "pending"
                    }`}
                  >
                    {doc.status === "approved"
                      ? "Validé"
                      : doc.status === "rejected"
                        ? "Refusé"
                        : "En attente"}
                  </span>
                  <span className="document-date">
                    {formatDateFR(doc.date)} · {doc.size}
                  </span>

                  <button
                    className="download-button"
                    onClick={() => handleDownload(doc)}
                    title="Télécharger"
                  >
                    <span>↓</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
