import {
  ArrowDownToLine,
  FileText,
} from "lucide-react";
import { downloadDocument } from "../data";
import type { DocumentItem } from "../types";

export function DocumentsPage({
  documents,
  uploadedDocuments,
  query,
  onDelete,
}: {
  documents: DocumentItem[];
  uploadedDocuments: DocumentItem[];
  query: string;
  onDelete: (id: string) => void;
}) {
  const search = query.toLowerCase().trim();

  const library = [...uploadedDocuments, ...documents];

  const filtered = library.filter((doc) => {
    const matchesSearch = search
      ? doc.name.toLowerCase().includes(search)
      : true;
    return matchesSearch;
  });

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
            <h3>{filtered.length} document{filtered.length > 1 ? "s" : ""}</h3>
          </div>
        </div>

        <div className="document-table">
          <div className="document-head">
            <span>NOM DU DOCUMENT</span>
            <span>TYPE</span>
            <span>COURS</span>
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

              <span className="document-course">{doc.type}</span>
              <span className="document-course">{doc.course}</span>
              <span className="document-date">{doc.date}</span>
              <span className="document-size">{doc.size}</span>

              {doc.file ? (
                <>
                  <button
                    className="download-button"
                    onClick={() => downloadDocument(doc)}
                  >
                    <ArrowDownToLine size={17} />
                  </button>
                  <button
                    className="download-button"
                    onClick={() => onDelete(doc.id!)}
                    title="Supprimer"
                  >
                    <span style={{ color: "#ef4444" }}>&times;</span>
                  </button>
                </>
              ) : (
                <button
                  className="download-button"
                  onClick={() =>
                    alert(
                      "Le téléchargement de cette ressource de la base sera disponible après connexion au stockage."
                    )
                  }
                >
                  <ArrowDownToLine size={17} />
                </button>
              )}
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

                <span className="document-course">{doc.type}</span>
                <span className="document-course">{doc.course}</span>
                <span className="document-date">{doc.date}</span>
                <span className="document-size">{doc.size}</span>

                <button
                  className="download-button"
                  onClick={() =>
                    alert(
                      "Le téléchargement de cette ressource de la base sera disponible après connexion au stockage."
                    )
                  }
                >
                  <ArrowDownToLine size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
