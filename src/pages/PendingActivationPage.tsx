import { useAuth } from "../auth/AuthContext";
import { ShieldAlert } from "lucide-react";

export function PendingActivationPage({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <ShieldAlert size={32} className="login-icon pending-icon" />
          <h2 className="login-title">Compte en attente d'activation</h2>
          <p className="login-subtitle">
            Votre profil existe, mais votre compte n'a pas encore été activé par l'administration.
          </p>
        </div>

        <p className="pending-detail">
          Utilisateur :{" "}
          <strong>{user?.email ?? "—"}</strong>
        </p>

        <button className="login-submit login-submit-outline" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}
