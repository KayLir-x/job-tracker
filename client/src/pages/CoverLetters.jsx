import { useCallback, useEffect, useState } from "react";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/cover-letters`;

function CoverLetters() {
  const [coverLetters, setCoverLetters] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    industry: "",
    content: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCoverLetters = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Anschreiben konnten nicht geladen werden");
      }

      setCoverLetters(data);
    } catch (error) {
      setError(error.message);
    }
  }, [token]);

  useEffect(() => {
    fetchCoverLetters();
  }, [fetchCoverLetters]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      title: "",
      industry: "",
      content: "",
    });

    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Anschreiben konnte nicht gespeichert werden");
      }

      setSuccessMessage(
        editingId ? "Anschreiben wurde aktualisiert." : "Anschreiben wurde gespeichert."
      );

      resetForm();
      await fetchCoverLetters();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(coverLetter) {
    setEditingId(coverLetter.id);

    setFormData({
      title: coverLetter.title || "",
      industry: coverLetter.industry || "",
      content: coverLetter.content || "",
    });

    setError("");
    setSuccessMessage("");
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Möchtest du dieses Anschreiben wirklich löschen?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Anschreiben konnte nicht gelöscht werden");
      }

      setSuccessMessage("Anschreiben wurde gelöscht.");

      if (editingId === id) {
        resetForm();
      }

      await fetchCoverLetters();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.section}>
        <h2 style={styles.heading}>
          {editingId ? "Anschreiben bearbeiten" : "Neues Anschreiben erstellen"}
        </h2>

        <p style={styles.description}>
          Speichere Anschreiben-Vorlagen für verschiedene Branchen oder Bewerbungen.
        </p>

        {error && <p style={styles.error}>{error}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="title">
              Titel *
            </label>
            <input
              id="title"
              style={styles.input}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="z.B. Anschreiben Frontend Developer"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="industry">
              Branche
            </label>
            <input
              id="industry"
              style={styles.input}
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="z.B. IT, Marketing, Finance"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="content">
              Inhalt *
            </label>
            <textarea
              id="content"
              style={styles.textarea}
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Schreibe hier dein Anschreiben..."
              required
            />
            <small style={styles.hint}>
              Der Inhalt muss mindestens 20 Zeichen lang sein.
            </small>
          </div>

          <div style={styles.actions}>
            <button style={styles.primaryButton} type="submit" disabled={loading}>
              {loading
                ? "Speichern..."
                : editingId
                  ? "Änderungen speichern"
                  : "Anschreiben speichern"}
            </button>

            {editingId && (
              <button style={styles.secondaryButton} type="button" onClick={resetForm}>
                Bearbeiten abbrechen
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Meine Anschreiben</h2>

        {coverLetters.length === 0 ? (
          <p style={styles.emptyText}>Noch keine Anschreiben vorhanden.</p>
        ) : (
          <div style={styles.cardList}>
            {coverLetters.map((coverLetter) => (
              <article key={coverLetter.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{coverLetter.title}</h3>

                    {coverLetter.industry && (
                      <p style={styles.meta}>Branche: {coverLetter.industry}</p>
                    )}
                  </div>

                  <p style={styles.date}>
                    {new Date(coverLetter.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>

                <pre style={styles.contentPreview}>{coverLetter.content}</pre>

                <div style={styles.cardActions}>
                  <button
                    style={styles.secondaryButton}
                    type="button"
                    onClick={() => handleEdit(coverLetter)}
                  >
                    Bearbeiten
                  </button>

                  <button
                    style={styles.dangerButton}
                    type="button"
                    onClick={() => handleDelete(coverLetter.id)}
                  >
                    Löschen
                  </button>
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
    display: "grid",
    gap: "24px",
  },
  section: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
  },
  heading: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "22px",
  },
  description: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#6b7280",
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
    fontWeight: "600",
    fontSize: "14px",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
  },
  textarea: {
    minHeight: "260px",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  hint: {
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "9px 14px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontWeight: "600",
    cursor: "pointer",
  },
  dangerButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  emptyText: {
    color: "#6b7280",
  },
  cardList: {
    display: "grid",
    gap: "16px",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    backgroundColor: "#f9fafb",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
  },
  meta: {
    margin: "6px 0 0",
    color: "#4b5563",
  },
  date: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  contentPreview: {
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    maxHeight: "240px",
    overflow: "auto",
    color: "#111827",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
};

export default CoverLetters;