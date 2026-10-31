import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { downloadDocument } from "../data";
import type { DocumentItem, Role } from "../types";

export function ValidationPage({
  uploadedDocuments,
  onValidate,
  role,
}: {
  uploadedDocuments: DocumentItem[];
  onValidate: (
    id: string,
    status: "approved" | "rejected",
    comment?: string
  ) => void;
  role: Role;
}) {
  const [comments, setComments] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    let matchesFilter = true;

    if (filter === "En attente") {
      matchesFilter = !doc.status || doc.status === "pending";
    } else if (filter === "Validés") {
      matchesFilter = doc.status === "approved";
    } else if (filter === "Refusés") {
      matchesFilter = doc.status === "rejected";
    }

    const matchesRole = role !== "etudiant" || doc.file !== undefined;

    return matchesFilter && matchesRole;
  });

  function rejectDocument(id: string) {
    const comment = comments[id]?.trim() ?? "";

    if (!comment) {
      setErrors((previous) => ({
        ...previous,
        [id]: "Ajoute un commentaire pour expliquer le refus.",
      }));

      return;
    }

    onValidate(id, "rejected", comment);

    setErrors((previous) => ({
      ...previous,
      [id]: "",
    }));
  }

  return (
    <div className="validation-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> CONTRÔLE DES DOCUMENTS
          </div>

          <h1>Validations</h1>

          <p className="page-subtitle">
            Consulte les dépôts et vérifie les documents partagés.
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
            <h3>Documents déposés</h3>
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

            <h3>Aucun document à afficher</h3>

            <p>
              Les documents déposés apparaîtront ici pour être examinés.
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

                {doc.status === "pending" || !doc.status ? (
                  <div className="validation-review">
                    <div className="upload-field">
                      <label htmlFor={`comment-${doc.id}`}>
                        Commentaire en cas de refus
                      </label>

                      <textarea
                        id={`comment-${doc.id}`}
                        rows={2}
                        value={comments[doc.id!] ?? ""}
                        onChange={(event) => {
                          setComments((previous) => ({
                            ...previous,
                            [doc.id!]: event.target.value,
                          }));

                          setErrors((previous) => ({
                            ...previous,
                            [doc.id!]: "",
                          }));
                        }}
                        placeholder="Exemple : Document illisible, merci de le déposer à nouveau..."
                      />

                      {errors[doc.id!] && (
                        <p className="upload-error">
                          {errors[doc.id!]}
                        </p>
                      )}
                    </div>

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

                      {role !== "etudiant" && (
                        <>
                          <button
                            className="reject-button"
                            onClick={() => rejectDocument(doc.id!)}
                          >
                            <X size={16} />
                            Refuser
                          </button>

                          <button
                            className="approve-button"
                            onClick={() => onValidate(doc.id!, "approved")}
                          >
                            <CheckCircle2 size={16} />
                            Valider
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
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
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
