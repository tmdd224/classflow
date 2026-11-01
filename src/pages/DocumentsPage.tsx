import { Download, FileText, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Course, DocumentItem } from "../types";
import {
  getDocumentSignedUrl,
  formatDateFR,
  typeLabelFromMimeType,
  translateDbError,
} from "../lib/supabase";

const PAGE_SIZE = 8;

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
  const [page, setPage] = useState(1);

  const courseById = new Map(courses.map((c) => [c.id, c.name]));

  const library = [...documents];

  const filtered = library.filter((doc) => {
    const matchesSearch = search
      ? doc.name.toLowerCase().includes(search)
      : true;
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPageDocs = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

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
          {currentPageDocs.map((doc) => {
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
                  <Download size={16} strokeWidth={1.8} />
                </button>

                <button
                  className="more-options"
                  aria-label="Plus d'options"
                >
                  <MoreHorizontal size={16} strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length > 0 && (
          <div className="list-footer">
            <span>
              {Math.min(page * PAGE_SIZE, filtered.length)} sur{" "}
              {filtered.length}
            </span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, ((page - 1) * PAGE_SIZE + currentPageDocs.length) / filtered.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Page précédente"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={p === page ? "active" : ""}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Page suivante"
            >
              ›
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
