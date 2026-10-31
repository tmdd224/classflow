import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configuration Supabase manquante : définissez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans le fichier .env.local à la racine du projet."
  );
}

/**
 * Client Supabase côté frontend (clé publishable uniquement, jamais la clé secrète/service_role).
 * Il est utilisé pour l'authentification et, plus tard, pour lire/écrire les données.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
