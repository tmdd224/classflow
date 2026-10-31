import { FileText } from "lucide-react";
import type { DocumentItem } from "../types";
import { getDocumentSignedUrl } from "../lib/supabase";

export function DocumentsPage({
  documents,
  query,
}: {
  documents: DocumentItem[];
  query: string;
}) {
  const search = query.toLowerCase().trim();

  const library = [...documents];

  const filtered = library.filter((doc) => {
    const matchesSearch = search
      ? doc.name.toLowerCase().includes(search)
      : true;
    return matchesSearch;
  });

  async function handleDownload(doc: DocumentItem) {
    const result = await getDocumentSignedUrl(doc.storage_path);
    if (!result.ok) {
      alert((result as { error: string }).error);
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
            <span>DATE</span>
            <span>TAILLE</span>
            <span />
          </div>
          {filtered.map((doc) => (
            <div className="document-row" key={doc.id}>
              <div className="document-name">
                <div className={`file-icon ${doc.color}`}>
                  <FileText size={18} />
                </div>

                <strong>{doc.name}</strong>
              </div>

              <span className="document-course">{doc.mime_type}</span>
              <span className="document-course">{doc.course}</span>
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
              <span className="document-date">{doc.date}</span>
              <span className="document-size">{doc.size}</span>

              <button
                className="download-button"
                onClick={() => handleDownload(doc)}
                title="Télécharger"
              >
                <span>↓</span>
              </button>
            </div>
          ))}
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
              <span>DATE</span>
              <span>TAILLE</span>
              <span />
            </div>
            {documents.map((doc) => (
              <div className="document-row" key={doc.id}>
                <div className="document-name">
                  <div className={`file-icon ${doc.color}`}>
                    <FileText size={18} />
                  </div>

                  <strong>{doc.name}</strong>
                </div>

                <span className="document-course">{doc.mime_type}</span>
                <span className="document-course">{doc.course}</span>
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
                <span className="document-date">{doc.date}</span>
                <span className="document-size">{doc.size}</span>

                <button
                  className="download-button"
                  onClick={() => handleDownload(doc)}
                  title="Télécharger"
                >
                  <span>↓</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
