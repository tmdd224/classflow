
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpen,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudUpload,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Trash2,
} from "lucide-react";

import { useRef, useState } from "react";
import "./App.css";

type PageKey =
  | "overview"
  | "courses"
  | "documents"
  | "upload"
  | "validation"
  | "settings";

type DocumentStatus = "pending" | "approved" | "rejected";

type Role = "etudiant" | "responsable" | "administrateur";

const roleLabels: Record<Role, string> = {
  etudiant: "Étudiant",
  responsable: "Responsable pédagogique",
  administrateur: "Administrateur",
};

type DocumentItem = {
  id?: string;
  name: string;
  type: string;
  course: string;
  courseId?: string;
  date: string;
  size: string;
  color: string;
  description?: string;
  file?: File;
  uploadedBy?: string;
  status?: DocumentStatus;
  reviewComment?: string;
};

const navigation: {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}[] = [
  { key: "overview", label: "Vue d’ensemble", icon: LayoutDashboard, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "courses", label: "Mes cours", icon: BookOpen, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "documents", label: "Documents", icon: FolderOpen, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "upload", label: "Déposer un fichier", icon: CloudUpload, roles: ["etudiant", "responsable", "administrateur"] },
  { key: "validation", label: "Validations", icon: ShieldCheck, roles: ["etudiant", "responsable", "administrateur"] },
];

const documents: DocumentItem[] = [
  {
    name: "Introduction au Big Data",
    type: "PDF",
    course: "Big Data",
    date: "Aujourd’hui",
    size: "2,4 Mo",
    color: "violet",
  },
  {
    name: "Exercices Python",
    type: "DOCX",
    course: "Développement",
    date: "Hier",
    size: "840 Ko",
    color: "blue",
  },
  {
    name: "Cours Intelligence Artificielle",
    type: "PDF",
    course: "Intelligence artificielle",
    date: "28 oct. 2026",
    size: "3,1 Mo",
    color: "orange",
  },
];

const allDocuments: DocumentItem[] = [
  ...documents,
  {
    name: "Introduction à l'intelligence artificielle",
    type: "PDF",
    course: "Intelligence artificielle",
    date: "30 octobre 2026",
    size: "2,1 Mo",
    color: "violet",
  },
  {
    name: "Les algorithmes de Machine Learning",
    type: "PDF",
    course: "Intelligence artificielle",
    date: "28 octobre 2026",
    size: "1,8 Mo",
    color: "violet",
  },
  {
    name: "Architecture Hadoop",
    type: "PDF",
    course: "Big Data",
    date: "28 octobre 2026",
    size: "2,7 Mo",
    color: "blue",
  },
  {
    name: "Apache Hive et SQL",
    type: "PPTX",
    course: "Big Data",
    date: "25 octobre 2026",
    size: "4,2 Mo",
    color: "blue",
  },
  {
    name: "Introduction à React",
    type: "PDF",
    course: "Développement",
    date: "24 octobre 2026",
    size: "1,5 Mo",
    color: "orange",
  },
  {
    name: "Travaux pratiques HTML et CSS",
    type: "DOCX",
    course: "Développement",
    date: "22 octobre 2026",
    size: "950 Ko",
    color: "orange",
  },
];

const courses = [
  {
    name: "Intelligence artificielle",
    code: "IA · L3",
    progress: 72,
    resources: 14,
    color: "purple",
    initials: "IA",
  },
  {
    name: "Big Data",
    code: "BD · L3",
    progress: 58,
    resources: 12,
    color: "blue",
    initials: "BD",
  },
  {
    name: "Développement Web",
    code: "DEV · L3",
    progress: 84,
    resources: 9,
    color: "orange",
    initials: "DW",
  },
];

const courseResources: Record<
  string,
  { name: string; type: string; date: string }[]
> = {
  "IA · L3": [
    {
      name: "Introduction à l'intelligence artificielle",
      type: "PDF",
      date: "30 octobre 2026",
    },
    {
      name: "Les algorithmes de Machine Learning",
      type: "PDF",
      date: "28 octobre 2026",
    },
    {
      name: "Exercices sur le KNN",
      type: "DOCX",
      date: "25 octobre 2026",
    },
  ],
  "BD · L3": [
    {
      name: "Introduction au Big Data",
      type: "PDF",
      date: "30 octobre 2026",
    },
    {
      name: "Architecture Hadoop",
      type: "PDF",
      date: "28 octobre 2026",
    },
    {
      name: "Apache Hive et SQL",
      type: "PPTX",
      date: "25 octobre 2026",
    },
  ],
  "DEV · L3": [
    {
      name: "Introduction à React",
      type: "PDF",
      date: "30 octobre 2026",
    },
    {
      name: "JavaScript : les fondamentaux",
      type: "PDF",
      date: "28 octobre 2026",
    },
    {
      name: "Travaux pratiques HTML et CSS",
      type: "DOCX",
      date: "25 octobre 2026",
    },
  ],
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentItem[]>([]);
const [role, setRole] = useState<Role>("etudiant");

  const pageTitle =
    navigation.find((item) => item.key === activePage)?.label ?? "Paramètres";

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  const pendingCount = uploadedDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  ).length;

  const filteredDocuments = documents.filter((doc) =>
    `${doc.name} ${doc.course}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function navigate(page: PageKey) {
    setActivePage(page);
    setMobileMenu(false);

    if (page !== "courses") {
      setSelectedCourse(null);
    }
  }

  function handleUpload(file: File, course: string, description: string) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type = extension.toUpperCase();

    const color =
      type === "PDF" ? "violet" : type === "DOCX" ? "blue" : "orange";

    const courseRecord = courses.find((c) => c.name === course);

    const newDocument: DocumentItem = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      type,
      course,
      courseId: courseRecord?.code,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      size: formatFileSize(file.size),
      color,
      description,
      file,
      uploadedBy: "Thierno D.",
      status: "pending",
      reviewComment: "",
    };

    setUploadedDocuments((previous) => [newDocument, ...previous]);
    setQuery("");
    navigate("documents");
  }

  function handleDeleteDocument(id: string) {
    setUploadedDocuments((previous) =>
      previous.filter((doc) => doc.id !== id)
    );
  }

  function handleValidation(
    id: string,
    status: "approved" | "rejected",
    comment = ""
  ) {
    setUploadedDocuments((previous) =>
      previous.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              status,
              reviewComment: comment,
            }
          : doc
      )
    );
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Fermer le menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={22} />
          </div>

          <span>
            classflow<span className="brand-dot">.</span>
          </span>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">ISM</div>

          <div className="workspace-copy">
            <strong>Mon espace</strong>
            <span>Année 2026 – 2027</span>
          </div>

          <ChevronRight size={16} className="muted-icon" />
        </div>

        <div className="demo-banner">
          Mode démonstration — non sécurisé
        </div>

        <div className="nav-label">ESPACE ACADÉMIQUE</div>

        <nav className="main-nav">
          {visibleNavigation.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${activePage === key ? "active" : ""}`}
              onClick={() => navigate(key)}
            >
              <Icon size={18} strokeWidth={1.8} />

              <span>{key === "validation" && role === "etudiant" ? "Mes dépôts" : label}</span>

              {key === "validation" && pendingCount > 0 && (
                <span className="nav-count">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-label secondary-label">PRÉFÉRENCES</div>

        <button
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          onClick={() => navigate("settings")}
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Paramètres</span>
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={17} />
            </div>

            <strong>
              Apprendre mieux,
              <br />
              ensemble.
            </strong>

            <p>
              Retrouve toutes tes ressources dans un seul espace.
            </p>

            <span className="upgrade-link">
              Découvrir ClassFlow <ArrowRight size={13} />
            </span>
          </div>

          <div className="profile-mini">
            <div className="profile-avatar">TD</div>

            <div className="profile-copy">
              <strong>Thierno D.</strong>
              <span>{roleLabels[role]} · L3 IA</span>
            </div>

            <MoreHorizontal size={19} className="muted-icon" />
          </div>

          <div className="role-selector-section">
            <label className="role-selector-label">Rôle (démo)</label>
            <select
              className="role-selector"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="etudiant">Étudiant</option>
              <option value="responsable">
                Responsable pédagogique
              </option>
              <option value="administrateur">Administrateur</option>
            </select>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Ouvrir le menu"
          >
            <LayoutDashboard size={20} />
          </button>

          <div className="breadcrumb">
            <span>ClassFlow</span>
            <ChevronRight size={14} />
            <strong>{pageTitle}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une ressource..."
              />

              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>

            <div className="top-avatar">TD</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "overview" ? (
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
                          setSelectedCourse(course.code);
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
                      <div
                        className="document-row"
                        key={doc.id ?? doc.name}
                      >
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
          ) : activePage === "courses" ? (
            <CoursesPage
              selectedCourse={selectedCourse}
              onSelectCourse={setSelectedCourse}
              uploadedDocuments={uploadedDocuments}
            />
          ) : activePage === "documents" ? (
            <DocumentsPage
              query={query}
              uploadedDocuments={uploadedDocuments}
              onDelete={handleDeleteDocument}
            />
          ) : activePage === "upload" ? (
            <UploadPage
              onUpload={handleUpload}
              onCancel={() => navigate("overview")}
            />
          ) : activePage === "validation" ? (
            role === "etudiant" ? (
              <MyDepositsPage uploadedDocuments={uploadedDocuments} />
            ) : (
              <ValidationPage
                uploadedDocuments={uploadedDocuments}
                onValidate={handleValidation}
                role={role}
              />
            )
          ) : activePage === "settings" ? (
            <PlaceholderPage
              page="settings"
              title={role === "administrateur" ? "Administration" : "Paramètres"}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function downloadDocument(doc: DocumentItem) {
  if (!doc.file) {
    alert(
      "Ce document est une donnée de démonstration. Seuls les fichiers que tu as déposés peuvent être téléchargés pour le moment."
    );
    return;
  }

  const url = URL.createObjectURL(doc.file);
  const link = document.createElement("a");

  link.href = url;
  link.download = doc.file.name;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function UploadPage({
  onUpload,
  onCancel,
}: {
  onUpload: (file: File, course: string, description: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("Big Data");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx", "pptx"].includes(extension ?? "")) {
      setError(
        "Format non accepté. Choisis un fichier PDF, DOCX ou PPTX."
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Le fichier dépasse la limite de 20 Mo.");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      validateFile(file);
    }
  }

  function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Sélectionne d'abord un fichier.");
      return;
    }

    onUpload(selectedFile, selectedCourse, description.trim());
  }

  return (
    <div className="upload-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> PARTAGE DE RESSOURCES
          </div>

          <h1>Déposer un fichier</h1>

          <p className="page-subtitle">
            Ajoute un support de cours à ta bibliothèque ClassFlow.
          </p>
        </div>
      </div>

      <form className="panel upload-form" onSubmit={submitUpload}>
        <div className="section-heading">
          <div>
            <span className="section-kicker">NOUVEAU DOCUMENT</span>
            <h3>Informations du fichier</h3>
          </div>
        </div>

        <div
          className={`upload-dropzone ${isDragging ? "dragging" : ""} ${
            selectedFile ? "has-file" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.pptx"
            className="upload-file-input"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                validateFile(file);
              }
            }}
          />

          {selectedFile ? (
            <>
              <div className="upload-selected-icon">
                <FileText size={30} />
              </div>

              <strong>{selectedFile.name}</strong>

              <span>
                {formatFileSize(selectedFile.size)} · Fichier prêt à être
                déposé
              </span>

              <button
                type="button"
                className="upload-change-button"
                onClick={() => {
                  setSelectedFile(null);

                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
              >
                <X size={15} /> Retirer le fichier
              </button>
            </>
          ) : (
            <>
              <div className="upload-cloud-icon">
                <CloudUpload size={34} />
              </div>

              <strong>Glisse ton document ici</strong>

              <span>
                ou sélectionne un fichier depuis ton ordinateur
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={() => inputRef.current?.click()}
              >
                <FolderOpen size={17} /> Choisir un fichier
              </button>

              <small>
                Formats acceptés : PDF, DOCX, PPTX · 20 Mo maximum
              </small>
            </>
          )}
        </div>

        {error && <p className="upload-error">{error}</p>}

        <div className="upload-fields">
          <div className="upload-field">
            <label htmlFor="upload-course">Cours associé</label>

            <select
              id="upload-course"
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
            >
              <option value="Big Data">Big Data</option>
              <option value="Intelligence artificielle">
                Intelligence artificielle
              </option>
              <option value="Développement">Développement Web</option>
            </select>
          </div>

          <div className="upload-field">
            <label htmlFor="upload-description">
              Description (facultatif)
            </label>

            <textarea
              id="upload-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Exemple : Support du cours de Big Data sur Apache Hive..."
              rows={4}
            />
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="reset-filters"
            onClick={onCancel}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={!selectedFile}
          >
            <CloudUpload size={17} /> Déposer le document
          </button>
        </div>
      </form>

      <div className="upload-information">
        <ShieldCheck size={19} />

        <p>
          Vérifie que ton document est lisible et qu'il correspond au cours
          sélectionné avant de le partager.
        </p>
      </div>
    </div>
  );
}

function CoursesPage({
  selectedCourse,
  onSelectCourse,
  uploadedDocuments,
}: {
  selectedCourse: string | null;
  onSelectCourse: (code: string | null) => void;
  uploadedDocuments: DocumentItem[];
}) {
  const selected = courses.find(
    (course) => course.code === selectedCourse
  );

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

function DocumentsPage({
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

function ValidationPage({
  uploadedDocuments,
  onValidate,
  role,
}: {
  uploadedDocuments: DocumentItem[];
  onValidate: (
    id: string,
    status: "approved" | "rejected",
    comment?: string
  ) => void;
  role: Role;
}) {
  const [comments, setComments] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("Tous");

  const pending = uploadedDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  );

  const approved = uploadedDocuments.filter(
    (doc) => doc.status === "approved"
  );

  const rejected = uploadedDocuments.filter(
    (doc) => doc.status === "rejected"
  );

  const filteredDocuments = uploadedDocuments.filter((doc) => {
    let matchesFilter = true;

    if (filter === "En attente") {
      matchesFilter = !doc.status || doc.status === "pending";
    } else if (filter === "Validés") {
      matchesFilter = doc.status === "approved";
    } else if (filter === "Refusés") {
      matchesFilter = doc.status === "rejected";
    }

    const matchesRole = role !== "etudiant" || doc.file !== undefined;

    return matchesFilter && matchesRole;
  });

  function rejectDocument(id: string) {
    const comment = comments[id]?.trim() ?? "";

    if (!comment) {
      setErrors((previous) => ({
        ...previous,
        [id]: "Ajoute un commentaire pour expliquer le refus.",
      }));

      return;
    }

    onValidate(id, "rejected", comment);

    setErrors((previous) => ({
      ...previous,
      [id]: "",
    }));
  }

  return (
    <div className="validation-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> CONTRÔLE DES DOCUMENTS
          </div>

          <h1>Validations</h1>

          <p className="page-subtitle">
            Consulte les dépôts et vérifie les documents partagés.
          </p>
        </div>
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
          <span>Validés</span>
        </div>

        <div className="panel validation-stat">
          <X size={22} />
          <strong>{rejected.length}</strong>
          <span>Refusés</span>
        </div>
      </div>

      <section className="panel validation-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SUIVI ACADÉMIQUE</span>
            <h3>Documents déposés</h3>
          </div>

          <select
            className="validation-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Validés">Validés</option>
            <option value="Refusés">Refusés</option>
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="validation-empty">
            <ShieldCheck size={35} />

            <h3>Aucun document à afficher</h3>

            <p>
              Les documents déposés apparaîtront ici pour être examinés.
            </p>
          </div>
        ) : (
          <div className="validation-list">
            {filteredDocuments.map((doc) => (
              <article className="validation-item" key={doc.id}>
                <div className="validation-document-header">
                  <div className={`file-icon ${doc.color}`}>
                    <FileText size={20} />
                  </div>

                  <div className="validation-document-info">
                    <strong>{doc.name}</strong>

                    <span>
                      {doc.type} · {doc.course} · {doc.date} · {doc.size}
                    </span>
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
                      ? "Validé"
                      : doc.status === "rejected"
                        ? "Refusé"
                        : "En attente"}
                  </span>
                </div>

                {doc.description && (
                  <p className="validation-description">
                    {doc.description}
                  </p>
                )}

                {doc.status === "rejected" && doc.reviewComment && (
                  <div className="validation-comment">
                    <strong>Motif du refus :</strong>
                    <p>{doc.reviewComment}</p>
                  </div>
                )}

                {doc.status === "pending" || !doc.status ? (
                  <div className="validation-review">
                    <div className="upload-field">
                      <label htmlFor={`comment-${doc.id}`}>
                        Commentaire en cas de refus
                      </label>

                      <textarea
                        id={`comment-${doc.id}`}
                        rows={2}
                        value={comments[doc.id!] ?? ""}
                        onChange={(event) => {
                          setComments((previous) => ({
                            ...previous,
                            [doc.id!]: event.target.value,
                          }));

                          setErrors((previous) => ({
                            ...previous,
                            [doc.id!]: "",
                          }));
                        }}
                        placeholder="Exemple : Document illisible, merci de le déposer à nouveau..."
                      />

                      {errors[doc.id!] && (
                        <p className="upload-error">
                          {errors[doc.id!]}
                        </p>
                      )}
                    </div>

                    <div className="validation-actions">
                      {doc.file && (
                        <button
                          className="reset-filters"
                          onClick={() => downloadDocument(doc)}
                        >
                          <ArrowDownToLine size={16} />
                          Télécharger
                        </button>
                      )}

                      {role !== "etudiant" && (
                        <>
                          <button
                            className="reject-button"
                            onClick={() => rejectDocument(doc.id!)}
                          >
                            <X size={16} />
                            Refuser
                          </button>

                          <button
                            className="approve-button"
                            onClick={() => onValidate(doc.id!, "approved")}
                          >
                            <CheckCircle2 size={16} />
                            Valider
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="validation-actions">
                    {doc.file && (
                      <button
                        className="reset-filters"
                        onClick={() => downloadDocument(doc)}
                      >
                        <ArrowDownToLine size={16} />
                        Télécharger
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MyDepositsPage({
  uploadedDocuments,
}: {
  uploadedDocuments: DocumentItem[];
}) {
  const [filter, setFilter] = useState("Tous");

  const pending = uploadedDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  );

  const approved = uploadedDocuments.filter(
    (doc) => doc.status === "approved"
  );

  const rejected = uploadedDocuments.filter(
    (doc) => doc.status === "rejected"
  );

  const filteredDocuments = uploadedDocuments.filter((doc) => {
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

  return (
    <div className="deposits-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> MES DÉPÔTS
          </div>

          <h1>Mes dépôts</h1>

          <p className="page-subtitle">
            Suivez l'état de vos documents déposés.
          </p>
        </div>
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
          <span>Validés</span>
        </div>

        <div className="panel validation-stat">
          <X size={22} />
          <strong>{rejected.length}</strong>
          <span>Refusés</span>
        </div>
      </div>

      <section className="panel validation-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SUIVI ACADÉMIQUE</span>
            <h3>Mes documents déposés</h3>
          </div>

          <select
            className="validation-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Validés">Validés</option>
            <option value="Refusés">Refusés</option>
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="validation-empty">
            <ShieldCheck size={35} />

            <h3>Aucun dépôt</h3>

            <p>
              Vos documents déposés apparaîtront ici pour suivi.
            </p>
          </div>
        ) : (
          <div className="validation-list">
            {filteredDocuments.map((doc) => (
              <article className="validation-item" key={doc.id}>
                <div className="validation-document-header">
                  <div className={`file-icon ${doc.color}`}>
                    <FileText size={20} />
                  </div>

                  <div className="validation-document-info">
                    <strong>{doc.name}</strong>

                    <span>
                      {doc.type} · {doc.course} · {doc.date} · {doc.size}
                    </span>
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
                      ? "Validé"
                      : doc.status === "rejected"
                        ? "Refusé"
                        : "En attente"}
                  </span>
                </div>

                {doc.description && (
                  <p className="validation-description">
                    {doc.description}
                  </p>
                )}

                {doc.status === "rejected" && doc.reviewComment && (
                  <div className="validation-comment">
                    <strong>Motif du refus :</strong>
                    <p>{doc.reviewComment}</p>
                  </div>
                )}

                <div className="validation-actions">
                  {doc.file && (
                    <button
                      className="reset-filters"
                      onClick={() => downloadDocument(doc)}
                    >
                      <ArrowDownToLine size={16} />
                      Télécharger
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  detail,
  time,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  time: string;
  tone: string;
}) {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${tone}`}>{icon}</div>

      <div className="activity-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>

      <time>{time}</time>
    </div>
  );
}

function PlaceholderPage({
  page,
  title,
}: {
  page: PageKey;
  title: string;
}) {
  const descriptions: Record<PageKey, string> = {
    overview: "",
    courses:
      "Retrouve tes matières, leur progression et toutes les ressources associées.",
    documents:
      "Une bibliothèque centralisée pour retrouver tes supports de cours.",
    upload: "Partage un support de cours avec ta communauté académique.",
    validation: "Suis les documents en attente de validation.",
    settings: "Gère ton profil et tes préférences ClassFlow.",
  };

  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <Activity size={25} />
      </div>

      <span className="section-kicker">
        CLASSFLOW · ESPACE ACADÉMIQUE
      </span>

      <h1>{title}</h1>

      <p>{descriptions[page]}</p>

      <div className="coming-soon">
        <Sparkles size={17} />
        Cette section sera construite dans la prochaine étape.
      </div>
    </div>
  );
}

export default App;
