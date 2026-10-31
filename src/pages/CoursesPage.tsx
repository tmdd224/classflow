import {
  ArrowDownToLine,
  ArrowRight,
  FileText,
} from "lucide-react";
import { downloadDocument, courses, courseResources } from "../data";
import type { DocumentItem } from "../types";

export function CoursesPage({
  selectedCourse,
  onSelectCourse,
  uploadedDocuments,
}: {
  selectedCourse: string | null;
  onSelectCourse: (code: string | null) => void;
  uploadedDocuments: DocumentItem[];
}) {
  const selected = courses.find((course) => course.code === selectedCourse);

  if (selected) {
    const resources = courseResources[selected.code] ?? [];

    const courseDeposits = uploadedDocuments.filter(
      (doc) => doc.courseId === selected.code || doc.course === selected.name
    );

    return (
      <div className="courses-page">
        <button
          className="text-button"
          onClick={() => onSelectCourse(null)}
        >
          ← Retour à mes cours
        </button>

        <div className="welcome-row">
          <div>
            <div className="eyebrow">
              <span className="live-dot" /> MON APPRENTISSAGE
            </div>

            <h1>{selected.name}</h1>

            <p className="page-subtitle">
              {selected.code} · {selected.resources} ressources disponibles
            </p>
          </div>
        </div>

        <section className="panel documents-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">BIBLIOTHÈQUE DU COURS</span>
              <h3>Ressources pédagogiques</h3>
            </div>
          </div>

          {resources.map((resource) => (
            <div className="document-row" key={resource.name}>
              <div className="document-name">
                <div className="file-icon violet">
                  <FileText size={18} />
                </div>

                <strong>{resource.name}</strong>
              </div>

              <span className="document-course">{resource.type}</span>
              <span className="document-date">{resource.date}</span>
              <span className="document-size">—</span>

              <button
                className="download-button"
                aria-label={`Télécharger ${resource.name}`}
                onClick={() =>
                  alert(
                    "Le téléchargement de cette ressource de démonstration sera disponible après connexion au stockage."
                  )
                }
              >
                <ArrowDownToLine size={17} />
              </button>
            </div>
          ))}
        </section>

        {courseDeposits.length > 0 && (
          <section className="panel documents-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">MES DÉPÔTS</span>
                <h3>Mes documents pour ce cours</h3>
              </div>
            </div>
            <div className="document-table">
              <div className="document-head">
                <span>NOM DU DOCUMENT</span>
                <span>STATUT</span>
                <span>DATE</span>
                <span>TAILLE</span>
                <span />
              </div>
              {courseDeposits.map((doc) => (
                <div className="document-row" key={doc.id}>
                  <div className="document-name">
                    <div className={`file-icon ${doc.color}`}>
                      <FileText size={18} />
                    </div>
                    <strong>{doc.name}</strong>
                  </div>
                  <span className="document-course">
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
                        ? "Validé"
                        : doc.status === "rejected"
                          ? "Refusé"
                          : "En attente"}
                    </span>
                  </span>
                  <span className="document-date">{doc.date}</span>
                  <span className="document-size">{doc.size}</span>
                  {doc.file && (
                    <button
                      className="download-button"
                      onClick={() => downloadDocument(doc)}
                    >
                      <ArrowDownToLine size={17} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> TON APPRENTISSAGE
          </div>

          <h1>Mes cours</h1>

          <p className="page-subtitle">
            Retrouve tes matières et toutes les ressources associées.
          </p>
        </div>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <button
            className="panel course-card"
            key={course.code}
            onClick={() => onSelectCourse(course.code)}
          >
            <div className={`course-icon ${course.color}`}>
              {course.initials}
            </div>

            <h3>{course.name}</h3>
            <p>{course.code}</p>

            <div className="progress-track">
              <div
                className={`progress-fill ${course.color}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>

            <div className="course-meta">
              <span>{course.progress}% parcouru</span>
              <span>{course.resources} ressources</span>
            </div>

            <span className="text-button">
              Ouvrir le cours <ArrowRight size={15} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
