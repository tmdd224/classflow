import { useState, useCallback } from "react";
import {
  Clock3,
  CheckCircle2,
  FileText,
  ShieldCheck,
  X,
  List,
} from "lucide-react";
import type { Course, DocumentItem, Role, User } from "../types";
import {
  getDocumentSignedUrl,
  reviewDocument,
  fetchDocumentEvents,
  translateDbError,
  formatDateFR,
  typeLabelFromMimeType,
} from "../lib/supabase";

export function ValidationPage({
  documents,
  courses,
  profiles,
  userId,
  role,
  onRefresh,
}: {
  documents: DocumentItem[];
  courses: Course[];
  profiles: User[];
  userId: string;
  role: Role;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState("Tous");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sélection par lot
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // Action par lot en cours de confirmation
  const [batchMode, setBatchMode] = useState<"approve" | "reject" | null>(null);
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchReason, setBatchReason] = useState("");

  // Traitement par lot
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    success: number;
    failures: Array<{ id: string; error: string }>;
  }>({ current: 0, total: 0, success: 0, failures: [] });
  const [batchResult, setBatchResult] = useState<{
    mode: "approve" | "reject";
    success: number;
    failures: Array<{ id: string; error: string }>;
  } | null>(null);

  // Historique des événements
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

  const courseById = new Map(courses.map((c) => [c.id, c.name]));
  const courseNameFor = (doc: DocumentItem) =>
    doc.courseId !== undefined ? courseById.get(doc.courseId) ?? "—" : "—";

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

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;
  const canBatchValidate = canValidate && hasSelection;

  const isPending = (doc: DocumentItem) =>
    !doc.status || doc.status === "pending";
  const isSelected = (docId: string) => selectedIds.has(docId);

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

  const toggleSelection = (docId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
    if (selectAllChecked) setSelectAllChecked(false);
  };

  const toggleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedIds(new Set());
      setSelectAllChecked(false);
    } else {
      const ids = new Set(pendingDocs.map((d) => d.id));
      setSelectedIds(ids);
      setSelectAllChecked(true);
    }
  };

  const startBatchAction = (mode: "approve" | "reject") => {
    if (!hasSelection || !canValidate) return;
    setBatchMode(mode);
    setBatchReason("");
    setBatchConfirmOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const cancelBatch = () => {
    setBatchConfirmOpen(false);
    setBatchMode(null);
    setBatchReason("");
    setActionError(null);
    setActionSuccess(null);
  };

  const processBatch = async () => {
    const mode = batchMode;
    const reason = batchReason.trim();
    const docsToProcess = pendingDocs.filter((d) => selectedIds.has(d.id));
    if (docsToProcess.length === 0 || !mode) {
      cancelBatch();
      return;
    }

    setBatchConfirmOpen(false);
    setBatchProcessing(true);
    setBatchProgress({ current: 0, total: docsToProcess.length, success: 0, failures: [] });

    const MAX_PARALLEL = 3;
    const allResults: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (let i = 0; i < docsToProcess.length; i += MAX_PARALLEL) {
      const batch = docsToProcess.slice(i, i + MAX_PARALLEL);
      const batchResults = await Promise.all(
        batch.map(async (doc) => {
          try {
            const result = await reviewDocument(
              doc.id,
              mode === "approve" ? "approved" : "rejected",
              mode === "reject" ? (reason || null) : null
            );
            return { id: doc.id, ok: result.ok, error: result.error };
          } catch (err) {
            return { id: doc.id, ok: false, error: translateDbError(err) };
          }
        })
      );
      allResults.push(...batchResults);

      const successCount = allResults.filter((r) => r.ok).length;
      const failures = allResults.filter((r) => !r.ok);
      setBatchProgress({
        current: Math.min(i + batch.length, docsToProcess.length),
        total: docsToProcess.length,
        success: successCount,
        failures: failures.map((f) => ({
          id: f.id,
          error: f.error ?? "Erreur inconnue",
        })),
      });
    }

    setBatchProcessing(false);
    setBatchResult({
      mode,
      success: allResults.filter((r) => r.ok).length,
      failures: allResults
        .filter((r) => !r.ok)
        .map((r) => ({ id: r.id, error: r.error ?? "Erreur inconnue" })),
    });

    // Réinitialiser la sélection et l'état de lot
    setSelectedIds(new Set());
    setSelectAllChecked(false);
    setBatchMode(null);
    setBatchReason("");

    // Recharger les données
    await onRefresh();
  };

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

      {/* Barre d'action fixe par lot */}
      {hasSelection && canBatchValidate && !batchProcessing && !batchResult && (
        <div className="batch-action-bar">
          <span>{selectedCount} sélectionné</span>
          <button
            type="button"
            className="primary-button"
            onClick={() => startBatchAction("approve")}
          >
            Valider la sélection
          </button>
          <button
            type="button"
            className="primary-button"
            style={{ background: "#c44", borderColor: "#c44" }}
            onClick={() => startBatchAction("reject")}
          >
            Refuser la sélection
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSelectedIds(new Set());
              setSelectAllChecked(false);
            }}
          >
            Désélectionner tout
          </button>
        </div>
      )}

      {/* Modal de confirmation du lot */}
      {batchConfirmOpen && (
        <div className="batch-modal-overlay" onClick={cancelBatch}>
          <div className="batch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="batch-modal-header">
              <h3>
                {batchMode === "approve"
                  ? "Valider la sélection"
                  : "Refuser la sélection"}
              </h3>
              <p>
                {selectedCount} document{selectedCount > 1 ? "s" : ""} va
                {batchMode === "approve" ? "être validé" : "être refusé"}.
              </p>
            </div>

            {batchMode === "reject" && (
              <div className="batch-modal-body">
                <label>Motif du refus (obligatoire) :</label>
                <textarea
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  rows={3}
                  placeholder="Motif du refus applicable à tous les documents sélectionnés"
                />
                {!batchReason.trim() && (
                  <span className="batch-modal-error">
                    Un motif est obligatoire pour refuser.
                  </span>
                )}
              </div>
            )}

            <div className="batch-modal-footer">
              <button
                type="button"
                className="text-button"
                onClick={cancelBatch}
              >
                Annuler
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={processBatch}
                disabled={batchMode === "reject" && !batchReason.trim()}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de traitement */}
      {batchProcessing && (
        <div className="batch-modal-overlay" style={{ pointerEvents: "none" }}>
          <div className="batch-modal">
            <div className="batch-modal-header">
              <h3>
                {batchMode === "approve" ? "Validation en cours" : "Refus en cours"}
              </h3>
              <p>
                {batchProgress.current} / {batchProgress.total} document{
                  batchProgress.total > 1 ? "s" : ""
                }
              </p>
            </div>
            <div className="batch-modal-body">
              <div className="batch-progress">
                <div
                  className="batch-progress-fill"
                  style={{
                    width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="batch-progress-text">
                {batchProgress.success} réussi{
                  batchProgress.success > 1 ? "s" : ""
                },
                {batchProgress.failures.length} échec{
                  batchProgress.failures.length > 1 ? "s" : ""
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rapport de résultat du lot */}
      {batchResult && (
        <div
          className="batch-modal-overlay"
          onClick={() => setBatchResult(null)}
        >
          <div className="batch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="batch-modal-header">
              <h3>
                {batchResult.mode === "approve"
                  ? "Validation terminée"
                  : "Refus terminé"}
              </h3>
            </div>
            <div className="batch-modal-body">
              <p>
                {batchResult.success} document{
                  batchResult.success > 1 ? "s" : ""
                } traité{batchResult.success > 1 ? "s" : ""} avec succès.
              </p>
              {batchResult.failures.length > 0 && (
                <>
                  <p className="batch-modal-error">
                    {batchResult.failures.length} échec{
                      batchResult.failures.length > 1 ? "s" : ""
                    }:
                  </p>
                  <ul>
                    {batchResult.failures.map((f) => (
                      <li key={f.id}>
                        Document {f.id}: {f.error}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="batch-modal-footer">
              <button
                type="button"
                className="primary-button"
                onClick={() => setBatchResult(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="panel validation-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SUIVI ACADEMIQUE</span>
            <h3>Documents déposés</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="select-all"
              checked={selectAllChecked}
              onChange={toggleSelectAll}
              disabled={!canValidate || pendingDocs.length === 0}
            />
            <label htmlFor="select-all" className="select-all-label">
              Tout sélectionner
            </label>
            <span className="select-all-count">
              ({pendingDocs.length} en attente)
            </span>

            <select
              className="validation-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              style={{ marginLeft: "auto" }}
            >
              <option value="Tous">Tous</option>
              <option value="En attente">En attente</option>
              <option value="Valides">Valides</option>
              <option value="Refuses">Refuses</option>
            </select>
          </div>
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
            {filteredDocuments.map((doc) => {
              const author = profileById.get(doc.uploaded_by);
              const docIsPending = isPending(doc);
              const docIsSelected = isSelected(doc.id);
              const events = eventsByDoc[doc.id];
              const isLoadingEvents = eventsLoading[doc.id];
              const isExpanded = eventsExpanded[doc.id];

              return (
                <article className="validation-item" key={doc.id}>
                  <div className="validation-document-header">
                    {canValidate && docIsPending && (
                      <div className="selection-checkbox">
                        <input
                          type="checkbox"
                          checked={docIsSelected}
                          onChange={() => toggleSelection(doc.id)}
                          disabled={batchProcessing || batchResult !== null}
                        />
                      </div>
                    )}

                    <div className={`file-icon ${doc.color}`}>
                      <FileText size={20} />
                    </div>

                    <div className="validation-document-info">
                      <strong>{doc.name}</strong>

                      <span>
                        {typeLabelFromMimeType(doc.mime_type)} ·
                        {courseNameFor(doc)} ·
                        {formatDateFR(doc.date)} · {doc.size}
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
                    {canValidate && docIsPending && !batchProcessing && !batchResult ? (
                      <>
                        {docIsSelected ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => toggleSelection(doc.id)}
                          >
                            Désélectionner
                          </button>
                        ) : null}
                      </>
                    ) : null}

                    <button
                      className="reset-filters"
                      onClick={() => handleDownload(doc)}
                    >
                      <span>↓</span> Télécharger
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
                                  {formatDateFR(event.created_at)}
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
