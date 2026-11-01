import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

type RoleOption = {
  value: "etudiant" | "responsable" | "administrateur";
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "etudiant",
    label: "Étudiant",
    icon: User,
    color: "#2563eb",
  },
  {
    value: "responsable",
    label: "Responsable pédagogique",
    icon: GraduationCap,
    color: "#7c3aed",
  },
  {
    value: "administrateur",
    label: "Administrateur",
    icon: ShieldCheck,
    color: "#059669",
  },
];

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption["value"] | null>(
    null
  );

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
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <GraduationCap size={20} />
            classflow<span className="login-dot">.</span>
          </div>
          <h2 className="login-title">Connexion</h2>
          <p className="login-subtitle">
            Accédez à votre espace académique ClassFlow.
          </p>
        </div>

        {error && (
          <div className="login-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="login-field">
            <Mail size={18} className="login-field-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <Lock size={18} className="login-field-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
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
          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>

        <div className="role-selector-section">
          <div className="role-selector-label">Je me connecte en tant que</div>
          <div className="role-selector-buttons">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.value}
                type="button"
                className={`role-selector-btn ${
                  selectedRole === role.value ? "active" : ""
                }`}
                onClick={() => setSelectedRole(selectedRole === role.value ? null : role.value)}
              >
                <role.icon size={16} strokeWidth={1.5} />
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="login-note">
          Pas de compte ? Les comptes sont créés par l’administration.
        </p>
      </div>
    </div>
  );
}
