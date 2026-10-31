import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Classe, Profile } from "../types";
import { roleLabels } from "../types";

export function SettingsPage({
  profile,
  updateProfile,
  classes,
}: {
  profile: Profile | null;
  updateProfile: (updates: { full_name?: string }) => Promise<{ error: string | null }>;
  classes: Classe[];
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [signOutAllConfirm, setSignOutAllConfirm] = useState(false);
  const [signOutAllLoading, setSignOutAllLoading] = useState(false);
  const [signOutAllError, setSignOutAllError] = useState<string | null>(null);
  const [signOutAllSuccess, setSignOutAllSuccess] = useState<string | null>(null);

  const classe = classes.find((c) => c.id === (profile?.class_id ?? ""));

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    const trimmed = fullName.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      setNameError("Le nom doit contenir entre 2 et 80 caractères.");
      return;
    }

    setNameLoading(true);
    const result = await updateProfile({ full_name: trimmed });
    setNameLoading(false);

    if (result.error) {
      setNameError(result.error);
    } else {
      setNameSuccess("Nom enregistré avec succès.");
      setFullName(trimmed);
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 10) {
      setPasswordError("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Le mot de passe doit contenir au moins une lettre et un chiffre.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      let message = "Erreur lors du changement de mot de passe.";
      const msg = (error.message ?? "").toLowerCase();
      if (msg.includes("session") || msg.includes("expired")) {
        message = "Session expirée. Veuillez vous reconnecter.";
      }
      setPasswordError(message);
    } else {
      setPasswordSuccess("Mot de passe modifié avec succès.");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleSignOutAll() {
    setSignOutAllError(null);
    setSignOutAllSuccess(null);
    setSignOutAllLoading(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      setSignOutAllSuccess("Déconnecté de tous les appareils.");
    } catch {
      setSignOutAllError("Impossible de se déconnecter de tous les appareils.");
    } finally {
      setSignOutAllLoading(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> PARAMÈTRES
          </div>

          <h1>Paramètres</h1>

          <p className="page-subtitle">
            Gérez votre profil et votre sécurité sur ClassFlow.
          </p>
        </div>
      </div>

      {/* ===== SECTION PROFIL ===== */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PROFIL</span>
            <h3>Informations personnelles</h3>
          </div>
        </div>

        <form className="upload-fields" onSubmit={handleSaveName}>
          <div className="upload-field">
            <label>Nom complet</label>
            <input
              className="upload-field input"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Votre nom complet"
              maxLength={80}
            />
            {nameError && <span className="upload-error">{nameError}</span>}
            {nameSuccess && <span className="success-message">{nameSuccess}</span>}
          </div>

          <div className="upload-field">
            <label>Email</label>
            <input
              className="upload-field input"
              type="email"
              value={profile?.email ?? ""}
              readOnly
            />
          </div>

          <div className="upload-field">
            <label>Rôle</label>
            <input
              className="upload-field input"
              type="text"
              value={roleLabels[profile?.role ?? "etudiant"]}
              readOnly
            />
            <span className="field-note">Géré par l'administration</span>
          </div>

          <div className="upload-field">
            <label>Classe</label>
            <input
              className="upload-field input"
              type="text"
              value={classe?.name ?? "Non assignée"}
              readOnly
            />
            <span className="field-note">Géré par l'administration</span>
          </div>

          <div className="upload-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={nameLoading}
            >
              {nameLoading ? "Enregistrement…" : "Enregistrer le nom"}
            </button>
          </div>
        </form>
      </section>

      {/* ===== SECTION SÉCURITÉ ===== */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SÉCURITÉ</span>
            <h3>Mot de passe et session</h3>
          </div>
        </div>

        <form className="upload-fields" onSubmit={handleChangePassword}>
          <div className="upload-field">
            <label>Nouveau mot de passe</label>
            <input
              className="upload-field input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Au moins 10 caractères, lettres et chiffres"
            />
          </div>

          <div className="upload-field">
            <label>Confirmer le mot de passe</label>
            <input
              className="upload-field input"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmez le nouveau mot de passe"
            />
          </div>

          {passwordError && <span className="upload-error">{passwordError}</span>}
          {passwordSuccess && (
            <span className="success-message">{passwordSuccess}</span>
          )}

          <div className="upload-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Modification…" : "Changer le mot de passe"}
            </button>
          </div>
        </form>

        <div className="upload-fields" style={{ marginTop: 32 }}>
          <button
            type="button"
            className="text-button"
            onClick={() => setSignOutAllConfirm(true)}
            disabled={signOutAllLoading}
          >
            <ShieldAlert size={16} />
            Se déconnecter de tous les appareils
          </button>

          {signOutAllConfirm && (
            <div className="confirm-dialog">
              <p>
                Confirmez-vous la déconnexion de tous les appareils ? Vous
                devrez vous reconnecter partout.
              </p>
              <div className="upload-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setSignOutAllConfirm(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSignOutAll}
                  disabled={signOutAllLoading}
                >
                  {signOutAllLoading ? "Déconnexion…" : "Confirmer"}
                </button>
              </div>
            </div>
          )}

          {signOutAllError && <span className="upload-error">{signOutAllError}</span>}
          {signOutAllSuccess && (
            <span className="success-message">{signOutAllSuccess}</span>
          )}
        </div>
      </section>
    </div>
  );
}
