import { useCallback, useEffect, useState } from "react";
import API_BASE_URL from "../api";

const API_URL = API_BASE_URL;

const STATUS_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "applied", label: "Beworben" },
  { value: "interview", label: "Vorstellungsgespräch" },
  { value: "rejected", label: "Absage" },
  { value: "offer", label: "Angebot" },
];

function getStatusLabel(status) {
  const statusOption = STATUS_OPTIONS.find((option) => option.value === status);

  return statusOption ? statusOption.label : "Unbekannt";
}

function getStatusStyle(status) {
  if (status === "interview") {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "rejected") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  if (status === "offer") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  return {
    background: "#dbeafe",
    color: "#1d4ed8",
  };
}

function Applications() {
  const [applications, setApplications] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [coverLetterId, setCoverLetterId] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deletingApplicationId, setDeletingApplicationId] = useState(null);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingApplicationId, setEditingApplicationId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editJobUrl, setEditJobUrl] = useState("");
  const [editStatus, setEditStatus] = useState("applied");
  const [editNotes, setEditNotes] = useState("");

  const token = localStorage.getItem("token");

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((application) => application.status === statusFilter);

  const fetchApplications = useCallback(async function () {
    try {
      const response = await fetch(`${API_URL}/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Bewerbungen konnten nicht geladen werden"
        );
      }

      setApplications(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  }, [token]);

  const fetchCoverLetters = useCallback(async function () {
    try {
      const response = await fetch(`${API_URL}/cover-letters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Anschreiben konnten nicht geladen werden"
        );
      }

      setCoverLetters(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchDocuments = useCallback(async function () {
    try {
      const response = await fetch(`${API_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Dokumente konnten nicht geladen werden"
        );
      }

      setDocuments(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMessage("Du bist nicht eingeloggt.");
      return;
    }

    fetchApplications();
    fetchCoverLetters();
    fetchDocuments();
  }, [token, fetchApplications, fetchCoverLetters, fetchDocuments]);

  function handleDocumentChange(documentId) {
    setSelectedDocuments((currentDocuments) => {
      if (currentDocuments.includes(documentId)) {
        return currentDocuments.filter((id) => id !== documentId);
      }

      return [...currentDocuments, documentId];
    });
  }

  function startEditing(application) {
    setEditingApplicationId(application.id);
    setEditCompany(application.company || "");
    setEditPosition(application.position || "");
    setEditJobUrl(application.jobUrl || "");
    setEditStatus(application.status || "applied");
    setEditNotes(application.notes || "");
  }

  function cancelEditing() {
    setEditingApplicationId(null);
    setEditCompany("");
    setEditPosition("");
    setEditJobUrl("");
    setEditStatus("applied");
    setEditNotes("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company,
          position,
          jobUrl,
          notes,
          status: "applied",
          coverLetterId: coverLetterId || null,
          documentIds: selectedDocuments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Bewerbung konnte nicht erstellt werden"
        );
      }

      setMessage("Bewerbung wurde erfolgreich erstellt.");

      setCompany("");
      setPosition("");
      setJobUrl("");
      setNotes("");
      setCoverLetterId("");
      setSelectedDocuments([]);

      await fetchApplications();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateApplication(applicationId) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: editCompany,
          position: editPosition,
          jobUrl: editJobUrl,
          status: editStatus,
          notes: editNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Bewerbung konnte nicht aktualisiert werden"
        );
      }

      setMessage("Bewerbung wurde aktualisiert.");
      cancelEditing();
      await fetchApplications();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteApplication(applicationId) {
    const confirmed = window.confirm(
      "Möchtest du diese Bewerbung wirklich löschen?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingApplicationId(applicationId);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/applications/${applicationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Bewerbung konnte nicht gelöscht werden"
        );
      }

      setMessage("Bewerbung wurde gelöscht.");

      if (editingApplicationId === applicationId) {
        cancelEditing();
      }

      await fetchApplications();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setDeletingApplicationId(null);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Bewerbungen</h1>

        <p style={styles.subtitle}>
          Erstelle neue Bewerbungen und verknüpfe sie mit Anschreiben und
          Dokumenten.
        </p>

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Firma</label>
            <input
              style={styles.input}
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="z. B. OpenAI"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Position</label>
            <input
              style={styles.input}
              type="text"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              placeholder="z. B. Frontend Developer"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Job-Link</label>
            <input
              style={styles.input}
              type="url"
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Anschreiben auswählen</label>
            <select
              style={styles.input}
              value={coverLetterId}
              onChange={(event) => setCoverLetterId(event.target.value)}
            >
              <option value="">Kein Anschreiben</option>

              {coverLetters.map((coverLetter) => (
                <option key={coverLetter.id} value={coverLetter.id}>
                  {coverLetter.title || `Anschreiben #${coverLetter.id}`}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dokumente auswählen</label>

            {documents.length === 0 ? (
              <p style={styles.emptyText}>Noch keine Dokumente vorhanden.</p>
            ) : (
              <div style={styles.checkboxList}>
                {documents.map((document) => (
                  <label key={document.id} style={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => handleDocumentChange(document.id)}
                    />

                    <span>
                      {document.title ||
                        document.originalName ||
                        document.fileName ||
                        document.filename ||
                        `Dokument #${document.id}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notizen</label>
            <textarea
              style={styles.textarea}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optionale Notizen zur Bewerbung..."
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Wird gespeichert..." : "Bewerbung erstellen"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <div style={styles.listHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Meine Bewerbungen</h2>
            <p style={styles.resultText}>
              {filteredApplications.length} von {applications.length} Bewerbungen
              angezeigt
            </p>
          </div>

          <div style={styles.statusFilters}>
            {STATUS_OPTIONS.map((statusOption) => (
              <button
                key={statusOption.value}
                type="button"
                style={{
                  ...styles.filterButton,
                  ...(statusFilter === statusOption.value
                    ? styles.activeFilterButton
                    : {}),
                }}
                onClick={() => setStatusFilter(statusOption.value)}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>

        {applications.length === 0 ? (
          <p style={styles.emptyText}>Noch keine Bewerbungen erstellt.</p>
        ) : filteredApplications.length === 0 ? (
          <p style={styles.emptyText}>
            Keine Bewerbungen mit diesem Status gefunden.
          </p>
        ) : (
          <div style={styles.applicationList}>
            {filteredApplications.map((application) => (
              <article key={application.id} style={styles.applicationItem}>
                {editingApplicationId === application.id ? (
                  <div style={styles.editForm}>
                    <h3 style={styles.applicationTitle}>
                      Bewerbung bearbeiten
                    </h3>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Firma</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={editCompany}
                        onChange={(event) => setEditCompany(event.target.value)}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Position</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={editPosition}
                        onChange={(event) =>
                          setEditPosition(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Job-Link</label>
                      <input
                        style={styles.input}
                        type="url"
                        value={editJobUrl}
                        onChange={(event) => setEditJobUrl(event.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Status</label>
                      <select
                        style={styles.input}
                        value={editStatus}
                        onChange={(event) => setEditStatus(event.target.value)}
                      >
                        <option value="applied">Beworben</option>
                        <option value="interview">Vorstellungsgespräch</option>
                        <option value="rejected">Absage</option>
                        <option value="offer">Angebot</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Notizen</label>
                      <textarea
                        style={styles.textarea}
                        value={editNotes}
                        onChange={(event) => setEditNotes(event.target.value)}
                      />
                    </div>

                    <div style={styles.buttonRow}>
                      <button
                        style={styles.button}
                        type="button"
                        disabled={loading}
                        onClick={() => handleUpdateApplication(application.id)}
                      >
                        {loading ? "Speichert..." : "Speichern"}
                      </button>

                      <button
                        style={styles.secondaryButton}
                        type="button"
                        onClick={cancelEditing}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.applicationContent}>
                    <div style={styles.applicationHeader}>
                      <div>
                        <h3 style={styles.applicationTitle}>
                          {application.position}
                        </h3>

                        <p style={styles.company}>{application.company}</p>
                      </div>

                      <span
                        style={{
                          ...styles.status,
                          ...getStatusStyle(application.status),
                        }}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </div>

                    {application.jobUrl && (
                      <a
                        style={styles.link}
                        href={application.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Job-Link öffnen
                      </a>
                    )}

                    {application.notes && (
                      <p style={styles.notes}>{application.notes}</p>
                    )}

                    {application.coverLetterSnapshot && (
                      <div style={styles.detailBox}>
                        <strong>Anschreiben:</strong>
                        <p style={styles.snapshot}>
                          {application.coverLetterSnapshot.slice(0, 160)}
                          {application.coverLetterSnapshot.length > 160
                            ? "..."
                            : ""}
                        </p>
                      </div>
                    )}

                    <div style={styles.detailBox}>
                      <strong>Dokumente:</strong>

                      {application.applicationDocuments?.length > 0 ? (
                        <ul style={styles.documentLinks}>
                          {application.applicationDocuments.map((item) => (
                            <li key={item.id}>
                              {item.document?.filePath ? (
                                <a
                                  style={styles.link}
                                  href={`http://localhost:5000${item.document.filePath}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {item.document.title ||
                                    item.document.originalName ||
                                    item.document.fileName ||
                                    `Dokument #${item.document.id}`}
                                </a>
                              ) : (
                                <span>
                                  {item.document?.title ||
                                    item.document?.originalName ||
                                    "Dokument ohne Namen"}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={styles.emptySmall}>
                          Keine Dokumente verknüpft.
                        </p>
                      )}
                    </div>

                    {application.createdAt && (
                      <p style={styles.createdAt}>
                        Erstellt am:{" "}
                        {new Date(application.createdAt).toLocaleDateString(
                          "de-DE"
                        )}
                      </p>
                    )}

                    <div style={styles.buttonRow}>
                      <button
                        style={styles.secondaryButton}
                        type="button"
                        onClick={() => startEditing(application)}
                      >
                        Bearbeiten
                      </button>

                      <button
                        style={styles.dangerButton}
                        type="button"
                        disabled={deletingApplicationId === application.id}
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        {deletingApplicationId === application.id
                          ? "Löscht..."
                          : "Löschen"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto 24px auto",
    padding: "24px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "32px",
  },
  subtitle: {
    margin: "0 0 24px 0",
    color: "#666",
    lineHeight: "1.5",
  },
  sectionTitle: {
    margin: "0",
    fontSize: "24px",
  },
  message: {
    padding: "12px",
    marginBottom: "16px",
    background: "#eef5ff",
    border: "1px solid #b8d7ff",
    borderRadius: "8px",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  formGroup: {
    display: "grid",
    gap: "6px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    minHeight: "100px",
    resize: "vertical",
  },
  checkboxList: {
    display: "grid",
    gap: "8px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  checkboxItem: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  button: {
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#111827",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  dangerButton: {
    padding: "12px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  emptyText: {
    color: "#777",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  resultText: {
    margin: "4px 0 0 0",
    color: "#666",
    fontSize: "14px",
  },
  statusFilters: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#111827",
    fontWeight: "bold",
    cursor: "pointer",
  },
  activeFilterButton: {
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
  },
  applicationList: {
    display: "grid",
    gap: "12px",
  },
  applicationItem: {
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#ffffff",
  },
  applicationContent: {
    display: "grid",
    gap: "12px",
  },
  applicationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  applicationTitle: {
    margin: "0 0 4px 0",
  },
  company: {
    margin: 0,
    color: "#666",
  },
  link: {
    display: "inline-block",
    color: "#2563eb",
    fontWeight: "bold",
    textDecoration: "none",
  },
  notes: {
    margin: 0,
    color: "#444",
    lineHeight: "1.5",
  },
  detailBox: {
    padding: "12px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  snapshot: {
    margin: "8px 0 0 0",
    color: "#444",
    lineHeight: "1.5",
  },
  documentLinks: {
    margin: "8px 0 0 0",
    paddingLeft: "20px",
  },
  emptySmall: {
    margin: "8px 0 0 0",
    color: "#777",
  },
  createdAt: {
    margin: 0,
    color: "#777",
    fontSize: "14px",
  },
  status: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    fontSize: "14px",
  },
  editForm: {
    display: "grid",
    gap: "16px",
  },
};

export default Applications;