import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

type RoleCard = {
  label: string;
  email: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
};

const ROLE_CARDS: RoleCard[] = [
  {
    label: "Étudiant",
    email: "etudiant@classflow.fr",
    icon: GraduationCap,
    color: "#7c3aed",
  },
  {
    label: "Responsable",
    email: "responsable@classflow.fr",
    icon: Shield,
    color: "#2563eb",
  },
  {
    label: "Administrateur",
    email: "admin@classflow.fr",
    icon: User,
    color: "#0f172a",
  },
];

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
    }
  }

  return (
    <div className="login-layout">
      {/* Panneau gauche - marque */}
      <div className="login-left">
        <div className="login-brand">
          <GraduationCap size={26} />
          <span>classflow<span className="login-dot">.</span></span>
        </div>

        <div className="login-badge">CAMPUS DIGITAL NOUVELLE GÉNÉRATION</div>

        <h1 className="login-left-title">
          Apprendre.<br />
          Partager.<br />
          Réussir ensemble.
        </h1>

        <p className="login-left-description">
          Un espace académique sécurisé pour centraliser les cours, déposer des
          ressources et piloter leur validation.
        </p>

        <div className="login-left-footer">
          <span className="footer-item">
            <Shield size={14} strokeWidth={1.5} /> Accès sécurisé
          </span>
          <span className="footer-separator">·</span>
          <span className="footer-item">Institut Supérieur du Management</span>
        </div>
      </div>

      {/* Panneau droit - formulaire */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-eyebrow">BIENVENUE</div>

          <h2 className="login-title">Connectez-vous</h2>
          <p className="login-subtitle">
            Accédez à votre espace selon votre rôle.
          </p>

          {error && (
            <div className="login-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="login-field">
              <label className="login-field-label">Adresse e-mail</label>
              <div className="login-field-wrapper">
                <Mail size={18} className="login-field-icon" />
                <input
                  type="email"
                  placeholder="vous@classflow.fr"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
                <Shield size={16} className="login-field-badge" />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field-label">Mot de passe</label>
              <div className="login-field-wrapper">
                <Lock size={18} className="login-field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          <div className="demo-section">
            <div className="demo-label">ACCÈS DE DÉMONSTRATION</div>

            <div className="role-cards">
              {ROLE_CARDS.map((role) => (
                <div key={role.label} className="role-card">
                  <div className="role-card-icon">
                    <role.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className="role-card-label">{role.label}</div>
                  <div className="role-card-email">{role.email}</div>
                </div>
              ))}
            </div>

            <p className="demo-note">
              Mot de passe démo : Classflow2026!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
