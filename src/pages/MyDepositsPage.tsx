import {
  ArrowDownToLine,
  Clock3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { downloadDocument } from "../data";
import type { DocumentItem } from "../types";

export function MyDepositsPage({
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
                  <p className="validation-description">{doc.description}</p>
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
