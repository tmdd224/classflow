import { ArrowDownToLine, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { downloadDocument, allDocuments } from "../data";
import type { DocumentItem } from "../types";

export function DocumentsPage({
  query,
  uploadedDocuments,
  onDelete,
}: {
  query: string;
  uploadedDocuments: DocumentItem[];
  onDelete: (id: string) => void;
}) {
  const [selectedType, setSelectedType] = useState("Tous");
  const [selectedCourse, setSelectedCourse] = useState("Tous");

  const library = [...uploadedDocuments, ...allDocuments];

  const filtered = library.filter((doc) => {
    const matchesQuery = `${doc.name} ${doc.course} ${
      doc.description ?? ""
    }`
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesType =
      selectedType === "Tous" || doc.type === selectedType;

    const matchesCourse =
      selectedCourse === "Tous" || doc.course === selectedCourse;

    return matchesQuery && matchesType && matchesCourse;
  });

  return (
    <div className="documents-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> TA BIBLIOTHÈQUE
          </div>

          <h1>Documents</h1>

          <p className="page-subtitle">
            Retrouve tous tes supports de cours au même endroit.
          </p>
        </div>

        <div className="document-total">
          <FileText size={20} />
          <strong>{filtered.length}</strong>
          <span>documents</span>
        </div>
      </div>

      <section className="panel documents-library">
        <div className="document-filters">
          <div className="filter-group">
            <label>Format</label>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="Tous">Tous les formats</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="PPTX">PPTX</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Matière</label>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="Tous">Tous les cours</option>
              <option value="Big Data">Big Data</option>
              <option value="Intelligence artificielle">
                Intelligence artificielle
              </option>
              <option value="Développement">Développement Web</option>
            </select>
          </div>

          <button
            className="reset-filters"
            onClick={() => {
              setSelectedType("Tous");
              setSelectedCourse("Tous");
            }}
          >
            Réinitialiser
          </button>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-kicker">ESPACE DE STOCKAGE</span>
            <h3>Tous les documents</h3>
          </div>

          <span className="document-count">
            {filtered.length} résultat(s)
          </span>
        </div>

        <div className="document-table">
          <div className="document-head">
            <span>NOM DU DOCUMENT</span>
            <span>COURS</span>
            <span>AJOUTÉ LE</span>
            <span>TAILLE</span>
            <span />
          </div>

          {filtered.map((doc) => (
            <div
              className="document-row"
              key={doc.id ?? `${doc.name}-${doc.course}`}
            >
              <div className="document-name">
                <div className={`file-icon ${doc.color}`}>
                  <FileText size={18} />
                </div>

                <div>
                  <strong>{doc.name}</strong>
                  <small>
                    {doc.type}
                    {doc.file ? " · Mon dépôt" : ""}
                  </small>
                </div>
              </div>

              <span className="document-course">{doc.course}</span>
              <span className="document-date">{doc.date}</span>
              <span className="document-size">{doc.size}</span>

              <div className="document-actions">
                <button
                  className="download-button"
                  aria-label={`Télécharger ${doc.name}`}
                  title="Télécharger"
                  onClick={() => downloadDocument(doc)}
                >
                  <ArrowDownToLine size={17} />
                </button>

                {doc.id && (
                  <button
                    className="download-button delete-document-button"
                    aria-label={`Supprimer ${doc.name}`}
                    title="Retirer de la bibliothèque"
                    onClick={() => onDelete(doc.id!)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="empty-state">
              Aucun document ne correspond à ces critères.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
