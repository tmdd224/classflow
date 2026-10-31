import {
  ArrowRight,
  Bell,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  MoreHorizontal,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

import { useState } from "react";
import "./App.css";

import { useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { PendingActivationPage } from "./pages/PendingActivationPage";
import { courses, courseResources, formatFileSize, navigation } from "./data";
import { AdminPage } from "./pages/AdminPage";
import { CoursesPage } from "./pages/CoursesPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { UploadPage } from "./pages/UploadPage";
import { ValidationPage } from "./pages/ValidationPage";
import { MyDepositsPage } from "./pages/MyDepositsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import type { DocumentItem, PageKey, Role } from "./types";
import { roleLabels } from "./types";

function initials(source: string) {
  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "?";
}

function App() {
  const { user, profile, loading, signOut } = useAuth();

  // Gestion de l'authentification Supabase.
  // 1. Tant que la session n'est pas chargée -> état de chargement.
  // 2. Sans session -> page de connexion uniquement.
  // 3. Profil introuvable ou compte non actif -> écran d'attente d'activation.
  if (loading) {
    return (
      <div className="page-content" style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Chargement de votre session…
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!profile || !profile.active) {
    return <PendingActivationPage onLogout={signOut} />;
  }

  const role: Role = profile.role;

  const [activePage, setActivePage] = useState<PageKey>("overview");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentItem[]>([]);

  const pageTitle =
    navigation.find((item) => item.key === activePage)?.label ?? "Paramètres";

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  const pendingCount = uploadedDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  ).length;

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

  const displayName =
    profile.full_name ?? profile.email?.split("@")[0] ?? "Utilisateur";
  const avatarInitials = initials(
    profile.full_name ?? profile.email?.split("@")[0] ?? "U"
  );
  const roleLabel =
    role === "etudiant" && profile.class_id
      ? `${roleLabels[role]} · ${profile.class_id}`
      : roleLabels[role];

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

        <div className="nav-label">ESPACE ACADÉMIQUE</div>

        <nav className="main-nav">
          {visibleNavigation.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${activePage === key ? "active" : ""}`}
              onClick={() => navigate(key)}
            >
              <Icon size={18} strokeWidth={1.8} />

              <span>
                {key === "validation" && role === "etudiant"
                  ? "Mes dépôts"
                  : label}
              </span>

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
            <div className="profile-avatar">{avatarInitials}</div>

            <div className="profile-copy">
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
            </div>

            <MoreHorizontal size={19} className="muted-icon" />

            <button className="logout-button" onClick={signOut}>
              Déconnexion
            </button>
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
            <OverviewPage
              courses={courses}
              courseResources={courseResources}
              uploadedDocuments={uploadedDocuments}
              query={query}
              navigate={navigate}
              onSelectCourse={setSelectedCourse}
            />
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
            <PlaceholderPage page="settings" title="Paramètres" />
          ) : activePage === "administration" ? (
            <AdminPage uploadedDocuments={uploadedDocuments} />
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default App;
