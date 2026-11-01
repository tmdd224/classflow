import { useState, useCallback } from "react";
import { Clock3, CheckCircle2, Download, FileText, ShieldCheck, X } from "lucide-react";
import type { Course, DocumentItem, User } from "../types";
import {
  getDocumentSignedUrl,
  formatDateFR,
  typeLabelFromMimeType,
} from "../lib/supabase";

export function MyDepositsPage({
  documents,
  courses,
  profiles,
  userId,
}: {
  documents: DocumentItem[];
  courses: Course[];
  profiles: User[];
  userId: string;
}) {
  const PAGE_SIZE = 8;
  const [filter, setFilter] = useState("Tous");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const courseById = new Map(courses.map((c) => [c.id, c.name]));
  const courseNameFor = (doc: DocumentItem) =>
    doc.courseId !== undefined ? courseById.get(doc.courseId) ?? "—" : "—";

  const profileById = new Map(
    profiles.map((p) => [p.id, p.name ?? p.email ?? "Utilisateur inconnu"])
  );

  const myDocuments = documents.filter((doc) => doc.uploaded_by === userId);

  const pending = myDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  );

  const approved = myDocuments.filter(
    (doc) => doc.status === "approved"
  );

  const rejected = myDocuments.filter(
    (doc) => doc.status === "rejected"
  );

  const filteredDocuments = myDocuments.filter((doc) => {
    if (filter === "En attente") {
      return !doc.status || doc.status === "pending";
    }

    if (filter === "Validés") {
      return doc.status === "approved";
    }

    if (filter === "Refusés") {
      return doc.status === "rejected";
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));

  const handleDownload = useCallback(
    async (doc: DocumentItem) => {
      setDownloadError(null);
      const result = await getDocumentSignedUrl(doc.storage_path);
      if (!result.ok) {
        const errorMessage =
          "error" in result ? result.error : "Erreur inconnue";
        setDownloadError(
          errorMessage.includes("introuvable") ||
            errorMessage.includes("not found")
            ? "Fichier introuvable dans le stockage."
            : errorMessage
        );
        return;
      }
      window.location.href = result.url;
    },
    []
  );

  return (
    <div className="deposits-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> MES DEPOTS
          </div>

          <h1>Mes depots</h1>

          <p className="page-subtitle">
            Suivez l'etat de vos documents depose.
          </p>
        </div>

        {downloadError && (
          <div className="upload-error" style={{ marginTop: 12 }}>
            {downloadError}
          </div>
        )}
      </div>

      <div className="validation-stats">
        <div className="panel validation-stat">
          <Clock3 size={22} />
          <strong>{pending.length}</strong>
          <span>En attente</span>
        </div>

        <div className="panel validation-stat">
          <CheckCircle2 size={22} />
          <strong>{approved.length}</strong>
          <span>Valides</span>
        </div>

        <div className="panel validation-stat">
          <X size={22} />
          <strong>{rejected.length}</strong>
          <span>Refuses</span>
        </div>
      </div>

      <section className="panel validation-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SUIVI ACADEMIQUE</span>
            <h3>Mes documents deposes</h3>
          </div>

          <select
            className="validation-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Valides">Valides</option>
            <option value="Refuses">Refuses</option>
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="validation-empty">
            <ShieldCheck size={35} />

            <h3>Aucun depot</h3>

            <p>
              Vos documents deposes apparaitront ici pour suivi.
            </p>
          </div>
        ) : (<>
          <div className="validation-list">
            {filteredDocuments
              .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
              .map((doc) => {
                const author = profileById.get(doc.uploaded_by);
                return (
                  <article className="validation-item" key={doc.id}>
                    <div className="validation-document-header">
                      <div className={`file-icon ${doc.color}`}>
                        <FileText size={20} />
                      </div>

                      <div className="validation-document-info">
                        <strong>{doc.name}</strong>

                        <span>
                          {typeLabelFromMimeType(doc.mime_type)} ·
                          {courseNameFor(doc)} ·
                          {formatDateFR(doc.date)} · {doc.size}
                        </span>

                        {author && (
                          <span className="document-author">
                            Par {author}
                          </span>
                        )}
                      </div>

                      <span
                        className={`validation-status ${
                          doc.status === "approved"
                            ? "approved"
                            : doc.status === "rejected"
                              ? "rejected"
                              : "pending"
                        }`}
                      >
                        {doc.status === "approved"
                          ? "Valide"
                          : doc.status === "rejected"
                            ? "Refuse"
                            : "En attente"}
                      </span>
                    </div>

                    {doc.description && (
                      <p className="validation-description">{doc.description}</p>
                    )}

                    {doc.status === "rejected" && (
                      <div className="validation-comment">
                        <strong>Motif du refus :</strong>
                        <p>
                          {doc.rejection_reason ||
                            "Ce document a ete refuse par l'equipe pedagogique."}
                        </p>
                      </div>
                    )}

                    <div className="validation-actions">
                      <button
                        className="download-button"
                        onClick={() => handleDownload(doc)}
                        title="Télécharger"
                      >
                        <Download size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>

          {filteredDocuments.length > 0 && (
            <div className="list-footer">
              <span>
                {Math.min(page * PAGE_SIZE, filteredDocuments.length)} sur{" "}
                {filteredDocuments.length}
              </span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0,
                        ((page - 1) * PAGE_SIZE +
                          Math.min(
                            PAGE_SIZE,
                            filteredDocuments.length - (page - 1) * PAGE_SIZE
                          )) /
                            filteredDocuments.length) *
                          100
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
        </>
        )}
      </section>
    </div>
  );
}
