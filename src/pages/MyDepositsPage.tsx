import { useState } from "react";
import { Clock3, CheckCircle2, FileText, ShieldCheck, X } from "lucide-react";
import type { DocumentItem } from "../types";
import { getDocumentSignedUrl } from "../lib/supabase";

const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export function MyDepositsPage({
  documents,
  userId,
}: {
  documents: DocumentItem[];
  userId: string;
}) {
  const [filter, setFilter] = useState("Tous");

  const myDocuments = documents.filter((doc) => doc.uploaded_by === userId);

  const pending = myDocuments.filter(
    (doc) => !doc.status || doc.status === "pending"
  );

  const approved = myDocuments.filter(
    (doc) => doc.status === "approved"
  );

  const rejected = myDocuments.filter(
    (doc) => doc.status === "rejected"
  );

  const filteredDocuments = myDocuments.filter((doc) => {
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

  async function handleDownload(doc: DocumentItem) {
    const result = await getDocumentSignedUrl(doc.storage_path);
    if (!result.ok) {
      alert((result as { error: string }).error);
      return;
    }
    window.location.href = result.url;
  }

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
                      {doc.course} · {formatDate(doc.date)} · {doc.size}
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
                  <p className="validation-description">{doc.description}</p>
                )}

                {doc.status === "rejected" && (
                  <div className="validation-comment">
                    <strong>Motif du refus :</strong>
                    <p>Ce document a été refusé par l'équipe pédagogique.</p>
                  </div>
                )}

                <div className="validation-actions">
                  <button
                    className="reset-filters"
                    onClick={() => handleDownload(doc)}
                  >
                    <span>↓</span> Télécharger
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
