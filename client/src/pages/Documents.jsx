import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);

  const token = localStorage.getItem("token");

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
      setMessage(error.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMessage("Du bist nicht eingeloggt.");
      return;
    }

    fetchDocuments();
  }, [token, fetchDocuments]);

  async function handleUpload(event) {
    event.preventDefault();

    if (!title.trim() || title.trim().length < 2) {
      setMessage("Bitte gib einen Titel mit mindestens 2 Zeichen ein.");
      return;
    }

    if (!selectedFile) {
      setMessage("Bitte wähle zuerst eine Datei aus.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");

      let data = {};

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          `Server hat kein JSON zurückgegeben: ${text.slice(0, 80)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Dokument konnte nicht hochgeladen werden"
        );
      }

      setMessage("Dokument wurde erfolgreich hochgeladen.");
      setSelectedFile(null);
      setTitle("");
      setCategory("");

      event.target.reset();

      await fetchDocuments();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDocument(documentId) {
    const confirmed = window.confirm(
      "Möchtest du dieses Dokument wirklich löschen? Es wird auch aus verknüpften Bewerbungen entfernt."
    );

    if (!confirmed) {
      return;
    }

    setDeletingDocumentId(documentId);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Dokument konnte nicht gelöscht werden"
        );
      }

      setMessage("Dokument wurde gelöscht.");
      await fetchDocuments();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setDeletingDocumentId(null);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Dokumente</h1>

        <p style={styles.subtitle}>
          Lade PDFs, JPGs oder PNGs hoch, damit du sie später mit Bewerbungen
          verknüpfen kannst.
        </p>

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleUpload} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Titel</label>
            <input
              style={styles.input}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="z. B. Lebenslauf"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Kategorie</label>
            <select
              style={styles.input}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Keine Kategorie</option>
              <option value="cv">Lebenslauf</option>
              <option value="certificate">Zeugnis</option>
              <option value="portfolio">Portfolio</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Datei auswählen</label>

            <input
              style={styles.input}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => setSelectedFile(event.target.files[0])}
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Wird hochgeladen..." : "Dokument hochladen"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Meine Dokumente</h2>

        {documents.length === 0 ? (
          <p style={styles.emptyText}>Noch keine Dokumente hochgeladen.</p>
        ) : (
          <div style={styles.documentList}>
            {documents.map((document) => (
              <article key={document.id} style={styles.documentItem}>
                <div>
                  <h3 style={styles.documentTitle}>
                    {document.title ||
                      document.originalName ||
                      document.fileName ||
                      `Dokument #${document.id}`}
                  </h3>

                  {document.category && (
                    <p style={styles.documentInfo}>
                      Kategorie: {document.category}
                    </p>
                  )}

                  <p style={styles.documentInfo}>
                    Datei: {document.originalName || document.fileName}
                  </p>

                  <p style={styles.documentInfo}>
                    Typ: {document.mimeType || "Unbekannt"}
                  </p>

                  <p style={styles.documentInfo}>
                    Größe: {document.fileSize || 0} Bytes
                  </p>

                  <div style={styles.documentActions}>
                    {document.filePath && (
                      <a
                        style={styles.link}
                        href={`http://localhost:5000${document.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Dokument öffnen
                      </a>
                    )}

                    <button
                      style={styles.deleteButton}
                      type="button"
                      disabled={deletingDocumentId === document.id}
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      {deletingDocumentId === document.id
                        ? "Löscht..."
                        : "Löschen"}
                    </button>
                  </div>
                </div>
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
    margin: "0 0 16px 0",
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
    background: "#ffffff",
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
  emptyText: {
    color: "#777",
  },
  documentList: {
    display: "grid",
    gap: "12px",
  },
  documentItem: {
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },
  documentTitle: {
    margin: "0 0 8px 0",
  },
  documentInfo: {
    margin: "4px 0",
    color: "#666",
  },
  documentActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  link: {
    display: "inline-block",
    color: "#2563eb",
    fontWeight: "bold",
    textDecoration: "none",
  },
  deleteButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Documents;