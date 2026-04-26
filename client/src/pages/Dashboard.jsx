import { useCallback, useEffect, useState } from "react";
import API_BASE_URL from "../api";

const API_URL = API_BASE_URL;

const STATUS_OPTIONS = [
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

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboardData = useCallback(async function () {
    try {
      setLoading(true);
      setMessage("");

      const [applicationsResponse, documentsResponse, coverLettersResponse] =
        await Promise.all([
          fetch(`${API_URL}/applications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/documents`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/cover-letters`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const applicationsData = await applicationsResponse.json();
      const documentsData = await documentsResponse.json();
      const coverLettersData = await coverLettersResponse.json();

      if (!applicationsResponse.ok) {
        throw new Error(
          applicationsData.error ||
            applicationsData.message ||
            "Bewerbungen konnten nicht geladen werden"
        );
      }

      if (!documentsResponse.ok) {
        throw new Error(
          documentsData.error ||
            documentsData.message ||
            "Dokumente konnten nicht geladen werden"
        );
      }

      if (!coverLettersResponse.ok) {
        throw new Error(
          coverLettersData.error ||
            coverLettersData.message ||
            "Anschreiben konnten nicht geladen werden"
        );
      }

      setApplications(applicationsData);
      setDocuments(documentsData);
      setCoverLetters(coverLettersData);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMessage("Du bist nicht eingeloggt.");
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, [token, fetchDashboardData]);

  const totalApplications = applications.length;
  const totalDocuments = documents.length;
  const totalCoverLetters = coverLetters.length;

  const appliedCount = applications.filter(
    (application) => application.status === "applied"
  ).length;

  const interviewCount = applications.filter(
    (application) => application.status === "interview"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "offer"
  ).length;

  const latestApplications = applications.slice(0, 5);

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.emptyText}>Dashboard wird geladen...</p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      {message && <p style={styles.message}>{message}</p>}

      <section style={styles.statsGrid}>
        <article style={styles.statCard}>
          <p style={styles.statLabel}>Bewerbungen gesamt</p>
          <strong style={styles.statNumber}>{totalApplications}</strong>
        </article>

        <article style={styles.statCard}>
          <p style={styles.statLabel}>Dokumente</p>
          <strong style={styles.statNumber}>{totalDocuments}</strong>
        </article>

        <article style={styles.statCard}>
          <p style={styles.statLabel}>Anschreiben</p>
          <strong style={styles.statNumber}>{totalCoverLetters}</strong>
        </article>

        <article style={styles.statCard}>
          <p style={styles.statLabel}>Angebote</p>
          <strong style={styles.statNumber}>{offerCount}</strong>
        </article>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Status-Übersicht</h2>
            <p style={styles.sectionSubtitle}>
              So verteilen sich deine Bewerbungen aktuell.
            </p>
          </div>
        </div>

        <div style={styles.statusGrid}>
          <article style={styles.statusItem}>
            <span
              style={{
                ...styles.statusBadge,
                ...getStatusStyle("applied"),
              }}
            >
              Beworben
            </span>
            <strong style={styles.statusCount}>{appliedCount}</strong>
          </article>

          <article style={styles.statusItem}>
            <span
              style={{
                ...styles.statusBadge,
                ...getStatusStyle("interview"),
              }}
            >
              Vorstellungsgespräch
            </span>
            <strong style={styles.statusCount}>{interviewCount}</strong>
          </article>

          <article style={styles.statusItem}>
            <span
              style={{
                ...styles.statusBadge,
                ...getStatusStyle("rejected"),
              }}
            >
              Absage
            </span>
            <strong style={styles.statusCount}>{rejectedCount}</strong>
          </article>

          <article style={styles.statusItem}>
            <span
              style={{
                ...styles.statusBadge,
                ...getStatusStyle("offer"),
              }}
            >
              Angebot
            </span>
            <strong style={styles.statusCount}>{offerCount}</strong>
          </article>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Letzte Bewerbungen</h2>
            <p style={styles.sectionSubtitle}>
              Die neuesten Einträge in deinem Job Tracker.
            </p>
          </div>
        </div>

        {latestApplications.length === 0 ? (
          <p style={styles.emptyText}>Noch keine Bewerbungen erstellt.</p>
        ) : (
          <div style={styles.latestList}>
            {latestApplications.map((application) => (
              <article key={application.id} style={styles.latestItem}>
                <div>
                  <h3 style={styles.applicationTitle}>
                    {application.position}
                  </h3>
                  <p style={styles.company}>{application.company}</p>
                </div>

                <div style={styles.latestRight}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(application.status),
                    }}
                  >
                    {getStatusLabel(application.status)}
                  </span>

                  {application.createdAt && (
                    <p style={styles.dateText}>
                      {new Date(application.createdAt).toLocaleDateString(
                        "de-DE"
                      )}
                    </p>
                  )}
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
  message: {
    padding: "12px",
    background: "#eef5ff",
    border: "1px solid #b8d7ff",
    borderRadius: "8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  statCard: {
    padding: "20px",
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  },
  statLabel: {
    margin: "0 0 8px 0",
    color: "#6b7280",
    fontWeight: "bold",
    fontSize: "14px",
  },
  statNumber: {
    display: "block",
    fontSize: "34px",
    color: "#111827",
  },
  card: {
    padding: "24px",
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "18px",
  },
  sectionTitle: {
    margin: "0 0 6px 0",
    fontSize: "24px",
  },
  sectionSubtitle: {
    margin: 0,
    color: "#6b7280",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#f9fafb",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    fontSize: "14px",
  },
  statusCount: {
    fontSize: "22px",
  },
  latestList: {
    display: "grid",
    gap: "12px",
  },
  latestItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "14px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#f9fafb",
  },
  applicationTitle: {
    margin: "0 0 4px 0",
    fontSize: "18px",
  },
  company: {
    margin: 0,
    color: "#6b7280",
  },
  latestRight: {
    display: "grid",
    justifyItems: "end",
    gap: "6px",
  },
  dateText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  emptyText: {
    color: "#6b7280",
    margin: 0,
  },
};

export default Dashboard;