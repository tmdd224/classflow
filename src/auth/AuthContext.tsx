import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fournit l'état d'authentification à toute l'application.
 * - loading : tant que la session n'est pas chargée depuis Supabase
 * - user : utilisateur connecté (ou null)
 * - profile : profil lu dans la table profiles (ou null)
 * - signIn / signOut : actions d'authentification
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
      if (mounted) setLoading(false);
    }

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, role, class_id, active")
      .eq("id", id)
      .single();

    if (error || !data) {
      setProfile(null);
      return;
    }
    setProfile(data as Profile);
  }

  function mapAuthError(error: unknown): string {
    const message = (error as { message?: string }).message?.toLowerCase() ?? "";
    if (message.includes("invalid login")) {
      return "Identifiants incorrects.";
    }
    if (message.includes("email not confirmed")) {
      return "Votre adresse email n'est pas encore confirmée.";
    }
    return "Erreur réseau ou serveur. Réessayez plus tard.";
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? mapAuthError(error) : null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider.");
  }
  return ctx;
}
