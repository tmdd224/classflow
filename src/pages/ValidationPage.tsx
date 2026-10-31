import { useState, useCallback } from "react";
import {
  Clock3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  X,
  RefreshCw,
  Download,
  List,
} from "lucide-react";
import type { DocumentItem, Role, User } from "../types";
import {
  getDocumentSignedUrl,
  reviewDocument,
  fetchDocumentEvents,
  translateDbError,
} from "../lib/supabase";

const MONTHS_FR = [
  "janv.", "fevr.", "mars", "avr.", "mai", "juin",
  "juil.", "aout", "sept.", "oct.", "nov.", "dec.",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export function ValidationPage({
  documents,
  profiles,
  userId,
  role,
  onRefresh,
}: {
  documents: DocumentItem[];
  profiles: User[];
  userId: string;
  role: Role;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState("Tous");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reasonDocId, setReasonDocId] = useState<string | null>(null);
  const [reasonType, setReasonType] = useState<"reject" | "reopen" | null>(
    null
  );
  const [reasonText, setReasonText] = useState("");
  const [eventsByDoc, setEventsByDoc] = useState<Record<string, any[]>>({});
  const [eventsLoading, setEventsLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [eventsExpanded, setEventsExpanded] = useState<Record<string, boolean>>(
    {}
  );

  const isResponsable = role === "responsable";
  const isAdmin = role === "administrateur";
  const canValidate = isResponsable || isAdmin;

  const profileById = new Map(
    profiles.map((p) => [p.id, p.name ?? p.email ?? "Utilisateur inconnu"])
  );

  // Les documents "En attente" passent en premier
  const pendingDocs = documents.filter(
    (doc) => !doc.status || doc.status === "pending"
  );
  const processedDocs = documents.filter(
    (doc) => doc.status === "approved" || doc.status === "rejected"
  );
  const sortedDocuments = [...pendingDocs, ...processedDocs];

  const pending = pendingDocs.length;
  const approved = documents.filter(
    (doc) => doc.status === "approved"
  ).length;
  const rejected = documents.filter(
    (doc) => doc.status === "rejected"
  ).length;

  const filteredDocuments = sortedDocuments.filter((doc) => {
    if (filter === "En attente") {
      return !doc.status || doc.status === "pending";
    }

    if (filter === "Valides") {
      return doc.status === "approved";
    }

    if (filter === "Refuses") {
      return doc.status === "rejected";
    }

    return true;
  });

  const handleDownload = useCallback(
    async (doc: DocumentItem) => {
      setDownloadError(null);
      const result = await getDocumentSignedUrl(doc.storage_path);
      if (!result.ok) {
        setDownloadError(
          result.error.includes("introuvable") ||
            result.error.includes("not found")
            ? "Fichier introuvable dans le stockage."
            : result.error
        );
        return;
      }
      window.location.href = result.url;
    },
    []
  );

  const handleValidate = useCallback(
    async (doc: DocumentItem) => {
      setActionError(null);
      setActionSuccess(null);
      setActionLoading(true);
      try {
        const result = await reviewDocument(doc.id, "approved", null);
        if (result.ok) {
          setActionSuccess("Document valide avec succes.");
          await onRefresh();
        } else {
          setActionError(result.error);
        }
      } finally {
        setActionLoading(false);
      }
    },
    [onRefresh]
  );

  const handleConfirmReject = useCallback(
    async (doc: DocumentItem) => {
      if (!reasonText.trim()) {
        setActionError("Un motif de refus est obligatoire.");
        return;
      }
      setActionError(null);
      setActionSuccess(null);
      setActionLoading(true);
      try {
        const result = await reviewDocument(
          doc.id,
          "rejected",
          reasonText.trim()
        );
        if (result.ok) {
          setActionSuccess("Document refuse avec succes.");
          setReasonDocId(null);
          setReasonType(null);
          setReasonText("");
          await onRefresh();
        } else {
          setActionError(result.error);
        }
      } finally {
        setActionLoading(false);
      }
    },
    [reasonText, onRefresh]
  );

  const handleConfirmReopen = useCallback(
    async (doc: DocumentItem) => {
      if (!reasonText.trim()) {
        setActionError(
          "Un motif est obligatoire pour rouvrir la decision."
        );
        return;
      }
      setActionError(null);
      setActionSuccess(null);
      setActionLoading(true);
      try {
        const result = await reviewDocument(
          doc.id,
          "reopened",
          reasonText.trim()
        );
        if (result.ok) {
          setActionSuccess("Decision revisee avec succes.");
          setReasonDocId(null);
          setReasonType(null);
          setReasonText("");
          await onRefresh();
        } else {
          setActionError(result.error);
        }
      } finally {
        setActionLoading(false);
      }
    },
    [reasonText, onRefresh]
  );

  const handleFetchEvents = useCallback(
    async (doc: DocumentItem) => {
      if (eventsByDoc[doc.id]) return;
      setEventsLoading((prev) => ({ ...prev, [doc.id]: true }));
      try {
        const result = await fetchDocumentEvents(doc.id);
        if (result.ok) {
          setEventsByDoc((prev) => ({ ...prev, [doc.id]: result.events }));
        }
      } finally {
        setEventsLoading((prev) => ({ ...prev, [doc.id]: false }));
      }
    },
    [eventsByDoc]
  );

  const toggleEvents = (docId: string) => {
    setEventsExpanded((prev) => ({ ...prev, [docId]: !prev[docId] }));
    if (!eventsExpanded[docId]) {
      const doc = documents.find((d) => d.id === docId);
      if (doc) {
        handleFetchEvents(doc);
      }
    }
  };

  const isActingOn = (docId: string) => reasonDocId === docId;

  return (
    <div className="validation-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> CONTROLE DES DOCUMENTS
          </div>

          <h1>Validations</h1>

          <p className="page-subtitle">
            Consultez les depots et verifiez les documents partages.
          </p>
        </div>

        {downloadError && (
          <div className="upload-error" style={{ marginTop: 12 }}>
            {downloadError}
          </div>
        )}

        {actionError && (
          <div className="upload-error" style={{ marginTop: 12 }}>
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="success-message" style={{ marginTop: 12 }}>
            {actionSuccess}
          </div>
        )}
      </div>

      <div className="validation-stats">
        <div className="panel validation-stat">
          <Clock3 size={22} />
          <strong>{pending}</strong>
          <span>En attente</span>
        </div>

        <div className="panel validation-stat">
          <CheckCircle2 size={22} />
          <strong>{approved}</strong>
          <span>Valides</span>
        </div>

        <div className="panel validation-stat">
          <X size={22} />
          <strong>{rejected}</strong>
          <span>Refuses</span>
        </div>
      </div>

      <section className="panel validation-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SUIVI ACADEMIQUE</span>
            <h3>Documents deposes</h3>
          </div>

          <select
            className="validation-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Valides">Valides</option>
            <option value="Refuses">Refuses</option>
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="validation-empty">
            <ShieldCheck size={35} />

            <h3>Aucun document a afficher</h3>

            <p>
              Les documents deposes apparaitront ici pour etre examines.
            </p>
          </div>
        ) : (
          <div className="validation-list">
            {filteredDocuments.map((doc) => {
              const author = profileById.get(doc.uploaded_by);
              const isPending = !doc.status || doc.status === "pending";
              const events = eventsByDoc[doc.id];
              const isLoadingEvents = eventsLoading[doc.id];
              const isExpanded = eventsExpanded[doc.id];

              return (
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

                      {author && (
                        <span className="document-author">
                          Par {author}
                        </span>
                      )}
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
                        ? "Valide"
                        : doc.status === "rejected"
                          ? "Refuse"
                          : "En attente"}
                    </span>
                  </div>

                  {doc.description && (
                    <p className="validation-description">{doc.description}</p>
                  )}

                  {doc.status === "rejected" && doc.rejection_reason && (
                    <div className="validation-comment">
                      <strong>Motif du refus :</strong>
                      <p>{doc.rejection_reason}</p>
                    </div>
                  )}

                  <div className="validation-actions">
                    {canValidate && isPending && (
                      <>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleValidate(doc)}
                          disabled={actionLoading || isActingOn(doc.id)}
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            setReasonDocId(doc.id);
                            setReasonType("reject");
                            setReasonText("");
                          }}
                          disabled={actionLoading}
                        >
                          Refuser
                        </button>
                      </>
                    )}

                    {canValidate && !isPending && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setReasonDocId(doc.id);
                          setReasonType("reopen");
                          setReasonText("");
                        }}
                        disabled={actionLoading || isActingOn(doc.id)}
                      >
                        Rouvrir / changer la decision
                      </button>
                    )}

                    {isActingOn(doc.id) && reasonType && (
                      <div className="action-reason">
                        <textarea
                          value={reasonText}
                          onChange={(event) =>
                            setReasonText(event.target.value)
                          }
                          placeholder={
                            reasonType === "reject"
                              ? "Motif du refus (obligatoire)"
                              : "Motif de la revision (obligatoire)"
                          }
                          rows={2}
                        />
                        <div className="upload-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setReasonDocId(null);
                              setReasonType(null);
                              setReasonText("");
                            }}
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            className="primary-button"
                            onClick={
                              reasonType === "reject"
                                ? () => handleConfirmReject(doc)
                                : () => handleConfirmReopen(doc)
                            }
                            disabled={actionLoading || !reasonText.trim()}
                          >
                            {actionLoading ? "Traitement…" : "Confirmer"}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      className="reset-filters"
                      onClick={() => handleDownload(doc)}
                    >
                      <span>↓</span> Telecharger
                    </button>

                    <button
                      className="reset-filters"
                      onClick={() => toggleEvents(doc.id)}
                    >
                      <List size={16} />
                      {isExpanded ? "Masquer l'historique" : "Historique"}
                    </button>

                    {isExpanded && (
                      <div className="document-history">
                        {isLoadingEvents ? (
                          <span>Chargement de l'historique…</span>
                        ) : events ? (
                          <ul>
                            {events.map((event: any) => (
                              <li key={event.id}>
                                <span className="history-action">
                                  {event.action}
                                </span>
                                <span className="history-date">
                                  {formatDate(event.created_at)}
                                </span>
                                {event.reason && (
                                  <span className="history-reason">
                                    {event.reason}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>Aucun historique disponible.</p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
