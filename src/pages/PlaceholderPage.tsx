import { Activity, Sparkles } from "lucide-react";
import type { PageKey } from "../types";

export function PlaceholderPage({
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
