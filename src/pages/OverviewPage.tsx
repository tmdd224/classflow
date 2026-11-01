import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Clock3,
  FileText,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { getDocumentSignedUrl } from "../lib/supabase";
import { ActivityItem } from "../components/ActivityItem";
import { StatCard } from "../components/StatCard";
import type {
  Course,
  DocumentItem,
  PageKey,
} from "../types";
import { formatDateFR, typeLabelFromMimeType } from "../lib/supabase";

export function OverviewPage({
  courses,
  documents,
  query,
  navigate,
  onSelectCourse,
  currentUserName,
  userId,
}: {
  courses: Course[];
  documents: DocumentItem[];
  query: string;
  navigate: (page: PageKey) => void;
  onSelectCourse: (code: string) => void;
  currentUserName: string;
  userId: string;
}) {
  const firstName = currentUserName.split(" ")[0];
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const courseById = new Map(courses.map((c) => [c.id, c.name]));
  const courseNameFor = (doc: DocumentItem) =>
    doc.courseId !== undefined ? courseById.get(doc.courseId) ?? "—" : "—";

  const myDocuments = documents.filter((doc) => doc.uploaded_by === userId);

  const myPending = myDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  ).length;

  const filteredDocuments = documents.filter((doc) =>
    `${doc.name} ${courseNameFor(doc)}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const recentDocuments = [...documents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

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
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> TON ESPACE ACADÉMIQUE
          </div>

          <h1>
            Bonjour, {firstName} <span>✦</span>
          </h1>

          <p className="page-subtitle">
            Voici ce qui se passe dans ton espace aujourd’hui.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("upload")}
        >
          <CloudUpload size={17} /> Déposer un document
        </button>
      </div>

      {downloadError && (
        <div className="upload-error" style={{ marginBottom: 16 }}>
          {downloadError}
        </div>
      )}

      <section className="hero-card">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={13} /> TON CAMPUS, EN UN SEUL ENDROIT
          </div>

          <h2>
            Le savoir circule.
            <br />
            <span>Les réussites aussi.</span>
          </h2>

          <p>
            Accède à tes cours, partage tes ressources et avance avec
            ta communauté académique.
          </p>

          <button
            className="hero-button"
            onClick={() => navigate("courses")}
          >
            Explorer mes cours <ArrowRight size={16} />
          </button>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-glow" />

          <div className="floating-card floating-card-top">
            <BookOpen size={18} />
            <span>Apprendre</span>
          </div>

          <div className="hero-book">
            <BookMarked size={70} strokeWidth={1.1} />
          </div>

          <div className="floating-card floating-card-bottom">
            <CheckCircle2 size={17} />
            <span>Progresser</span>
          </div>

          <div className="sparkle sparkle-one">✳</div>
          <div className="sparkle sparkle-two">✦</div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={<BookOpen />}
          label="Cours actifs"
          value={String(courses.filter((c) => c.semester === 1).length)}
          note="Ton programme actuel"
          tone="purple"
        />

        <StatCard
          icon={<FileText />}
          label="Ressources"
          value={String(documents.length)}
          note="Ressources disponibles"
          tone="blue"
        />

        <StatCard
          icon={<CloudUpload />}
          label="Mes dépôts"
          value={String(myDocuments.length).padStart(2, "0")}
          note="Documents partagés"
          tone="orange"
        />

        <StatCard
          icon={<Clock3 />}
          label="En attente"
          value={String(myPending).padStart(2, "0")}
          note="À faire valider"
          tone="green"
        />
      </section>

      <div className="content-grid">
        <section className="panel courses-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">TON APPRENTISSAGE</span>
              <h3>Mes cours</h3>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("courses")}
            >
              Voir tout <ArrowRight size={15} />
            </button>
          </div>

          <div className="course-list">
            {courses.map((course) => {
              const validatedDocs = documents.filter(
                (doc) => doc.course === course.name
              ).length;

              return (
                <button
                  className="course-row"
                  key={course.code}
                  onClick={() => {
                    onSelectCourse(course.code);
                    navigate("courses");
                  }}
                >
                  <div className={`course-icon ${course.color}`}>
                    {course.initials}
                  </div>

                  <div className="course-info">
                    <div className="course-title-line">
                      <strong>{course.name}</strong>
                      <span>
                        {validatedDocs} document{
                          validatedDocs > 1 ? "s" : ""
                        }
                      </span>
                    </div>

                    <div className="course-meta">
                      <span>{(course.planned_hours ?? 0)}h</span>
                    </div>
                  </div>

                  <ChevronRight size={17} className="muted-icon" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                DERNIÈRES MISES À JOUR
              </span>
              <h3>Activité récente</h3>
            </div>

            <button className="more-button" aria-label="Plus">
              <MoreHorizontal size={19} />
            </button>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="validation-empty">
              <ShieldCheck size={35} />
              <h3>Aucune activité pour le moment</h3>
              <p>
                Les documents de cours apparaîtront ici dès qu’ils seront
                disponibles.
              </p>
            </div>
          ) : (
            <div className="activity-list">
              {recentDocuments.map((doc) => (
                <ActivityItem
                  key={doc.id}
                  icon={<FileText />}
                  title={doc.name}
                  detail={courseNameFor(doc)}
                  time={doc.date}
                  tone={doc.mime_type === "application/pdf" ? "purple" : "blue"}
                />
              ))}
            </div>
          )}

          <button
            className="activity-footer"
            onClick={() => navigate("documents")}
          >
            Consulter les documents <ArrowRight size={15} />
          </button>
        </section>
      </div>

      <section className="panel documents-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">TA BIBLIOTHÈQUE</span>
            <h3>Documents récents</h3>
          </div>

          <button
            className="text-button"
            onClick={() => navigate("documents")}
          >
            Toute la bibliothèque <ArrowRight size={15} />
          </button>
        </div>

        <div className="document-table">
          <div className="document-head">
            <span>NOM DU DOCUMENT</span>
            <span>TYPE</span>
            <span>COURS</span>
            <span>DATE / TAILLE</span>
            <span />
          </div>

          {filteredDocuments
            .slice(0, 5)
            .map((doc) => (
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
                <span className="document-course">{courseNameFor(doc)}</span>
                <span className="document-date">
                  {formatDateFR(doc.date)} · {doc.size}
                </span>

                <button
                  className="download-button"
                  aria-label={`Télécharger ${doc.name}`}
                  onClick={() => handleDownload(doc)}
                >
                  <ArrowDownToLine size={17} />
                </button>
              </div>
            ))}
        </div>
      </section>

      <footer className="page-footer">
        <span>© 2026 ClassFlow</span>
        <span>
          Conçu pour apprendre et partager{" "}
          <span className="footer-heart">♥</span>
        </span>
        <span>Version 1.0.0</span>
      </footer>
    </>
  );
}
