import { ArrowRight, Download, FileText } from "lucide-react";
import { useState } from "react";
import {
  getDocumentSignedUrl,
  formatDateFR,
  typeLabelFromMimeType,
} from "../lib/supabase";
import type { Course, DocumentItem } from "../types";

export function CoursesPage({
  courses,
  documents,
  selectedCourse,
  onSelectCourse,
  userId,
}: {
  courses: Course[];
  documents: DocumentItem[];
  selectedCourse: string | null;
  onSelectCourse: (code: string | null) => void;
  userId: string;
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Construire les ressources par cours à partir des documents de la base
  const courseResources: Record<string, { name: string; type: string; date: string; storage_path: string }[]> = {};
  for (const doc of documents) {
    if (doc.courseId === undefined) continue;
    if (!courseResources[doc.courseId]) {
      courseResources[doc.courseId] = [];
    }
    courseResources[doc.courseId].push({
      name: doc.name,
      type: typeLabelFromMimeType(doc.mime_type),
      date: formatDateFR(doc.date),
      storage_path: doc.storage_path,
    });
  }
  // S'assurer que tous les cours ont une entrée (même vide)
  for (const course of courses) {
    if (!courseResources[course.id]) {
      courseResources[course.id] = [];
    }
  }

  const selected = courses.find((course) => course.code === selectedCourse);

  async function handleDownload(doc: DocumentItem) {
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
  }

  async function handleResourceDownload(resource: { name: string; storage_path: string }) {
    setDownloadError(null);
    const result = await getDocumentSignedUrl(resource.storage_path);
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
  }

  const validatedDocsForCourse = (course: Course) =>
    documents.filter(
      (doc) =>
        doc.uploaded_by === userId &&
        doc.status === "approved" &&
        doc.courseId !== undefined &&
        doc.courseId === course.id
    ).length;

  const coursesBySemester = courses.reduce(
    (acc, course) => {
      const sem = course.semester ?? 1;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(course);
      return acc;
    },
    {} as Record<number, Course[]>
  );

  if (selected) {
    const resources = courseResources[selected.id] ?? [];

    const courseDeposits = documents.filter(
      (doc) =>
        doc.uploaded_by === userId &&
        doc.courseId !== undefined &&
        doc.courseId === selected.id
    );

    return (
      <div className="courses-page">
        {downloadError && (
          <div className="upload-error" style={{ marginBottom: 16 }}>
            {downloadError}
          </div>
        )}
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
              {(selected.planned_hours ?? 0)}h · {validatedDocsForCourse(selected)} document{
                validatedDocsForCourse(selected) > 1 ? "s" : ""
              } validé{
                validatedDocsForCourse(selected) > 1 ? "s" : ""
              }
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
                onClick={() => handleResourceDownload(resource)}
              >
                <Download size={16} strokeWidth={1.8} />
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
                <span>DATE / TAILLE</span>
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

      {[1, 2].map((sem) => {
        const semCourses = coursesBySemester[sem] ?? [];
        if (semCourses.length === 0) return null;

        return (
          <section key={sem} className="semester-section">
            <h2 className="semester-title">Semestre {sem}</h2>
            <div className="courses-grid">
              {semCourses.map((course) => (
                <button
                  className="panel course-card"
                  key={course.code}
                  onClick={() => onSelectCourse(course.code)}
                >
                  <div className={`course-icon ${course.color}`}>
                    {course.initials}
                  </div>

                  <h3>{course.name}</h3>

                  <div className="course-meta">
                    <span>{(course.planned_hours ?? 0)}h</span>
                    <span>
                      {validatedDocsForCourse(course)} document{
                        validatedDocsForCourse(course) > 1 ? "s" : ""
                      } validé{
                        validatedDocsForCourse(course) > 1 ? "s" : ""
                      }
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        course.color === "blue" ? "blue" : course.color === "orange" ? "orange" : "purple"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, course.progress ?? 0))}%` }}
                    />
                  </div>

                  <span className="text-button">
                    Ouvrir le cours <ArrowRight size={15} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
