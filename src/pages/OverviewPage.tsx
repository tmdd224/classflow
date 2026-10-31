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
  Sparkles,
  Users,
} from "lucide-react";
import { downloadDocument } from "../data";
import { ActivityItem } from "../components/ActivityItem";
import { StatCard } from "../components/StatCard";
import type {
  Course,
  CourseResource,
  DocumentItem,
  PageKey,
} from "../types";

export function OverviewPage({
  courses,
  documents,
  courseResources,
  uploadedDocuments,
  query,
  navigate,
  onSelectCourse,
}: {
  courses: Course[];
  documents: DocumentItem[];
  courseResources: Record<string, CourseResource[]>;
  uploadedDocuments: DocumentItem[];
  query: string;
  navigate: (page: PageKey) => void;
  onSelectCourse: (code: string) => void;
}) {
  const pendingCount = uploadedDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  ).length;

  const filteredDocuments = documents.filter((doc) =>
    `${doc.name} ${doc.course}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> TON ESPACE ACADÉMIQUE
          </div>

          <h1>
            Bonjour, Thierno <span>✦</span>
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
          value="03"
          note="Ton programme actuel"
          tone="purple"
        />

        <StatCard
          icon={<FileText />}
          label="Ressources"
          value={String(Object.values(courseResources).flat().length + uploadedDocuments.length)}
          note="Ressources disponibles"
          tone="blue"
        />

        <StatCard
          icon={<CloudUpload />}
          label="Mes dépôts"
          value={String(uploadedDocuments.length).padStart(2, "0")}
          note="Documents partagés"
          tone="orange"
        />

        <StatCard
          icon={<Clock3 />}
          label="En attente"
          value={String(pendingCount).padStart(2, "0")}
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
            {courses.map((course) => (
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
                    <span>{course.resources} ressources</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${course.color}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <div className="course-meta">
                    <span>{course.code}</span>
                    <span>{course.progress}% parcouru</span>
                  </div>
                </div>

                <ChevronRight size={17} className="muted-icon" />
              </button>
            ))}
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

          <div className="activity-list">
            <ActivityItem
              icon={<FileText />}
              title="Introduction au Big Data"
              detail="Ajouté dans Big Data"
              time="Il y a 2 h"
              tone="purple"
            />

            <ActivityItem
              icon={<Users />}
              title="Nouveau cours disponible"
              detail="Développement Web"
              time="Hier"
              tone="blue"
            />

            <ActivityItem
              icon={<CheckCircle2 />}
              title="Document validé"
              detail="Exercices Python"
              time="28 oct."
              tone="green"
            />
          </div>

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
            <span>COURS</span>
            <span>AJOUTÉ LE</span>
            <span>TAILLE</span>
            <span />
          </div>

          {[...uploadedDocuments, ...filteredDocuments]
            .slice(0, 5)
            .map((doc) => (
              <div className="document-row" key={doc.id ?? doc.name}>
                <div className="document-name">
                  <div className={`file-icon ${doc.color}`}>
                    <FileText size={18} />
                  </div>
                  <strong>{doc.name}</strong>
                </div>

                <span className="document-course">{doc.course}</span>
                <span className="document-date">{doc.date}</span>
                <span className="document-size">{doc.size}</span>

                <button
                  className="download-button"
                  aria-label={`Télécharger ${doc.name}`}
                  onClick={() => downloadDocument(doc)}
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
