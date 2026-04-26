import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Applications from "./pages/Applications.jsx";
import Documents from "./pages/Documents.jsx";
import CoverLetters from "./pages/CoverLetters.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [activePage, setActivePage] = useState("dashboard");
  const [authPage, setAuthPage] = useState("login");

  function handleLogin() {
    setIsLoggedIn(true);
    setActivePage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setActivePage("dashboard");
  }

  function getPageTitle() {
    if (activePage === "dashboard") {
      return "Dashboard";
    }

    if (activePage === "applications") {
      return "Bewerbungen";
    }

    if (activePage === "documents") {
      return "Dokumente";
    }

    if (activePage === "coverLetters") {
      return "Anschreiben";
    }

    return "Job Tracker";
  }

  if (!isLoggedIn) {
  if (authPage === "register") {
    return <Register onShowLogin={() => setAuthPage("login")} />;
  }

  return (
    <Login
      onLogin={handleLogin}
      onShowRegister={() => setAuthPage("register")}
    />
  );
}

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <strong style={styles.logo}>Job Tracker</strong>
            <p style={styles.logoSubtitle}>
              Bewerbungen, Dokumente und Anschreiben verwalten
            </p>
          </div>

          <nav style={styles.nav}>
            <div style={styles.navLinks}>
              <button
                style={{
                  ...styles.navButton,
                  ...(activePage === "dashboard" ? styles.activeButton : {}),
                }}
                onClick={() => setActivePage("dashboard")}
              >
                Dashboard
              </button>

              <button
                style={{
                  ...styles.navButton,
                  ...(activePage === "applications" ? styles.activeButton : {}),
                }}
                onClick={() => setActivePage("applications")}
              >
                Bewerbungen
              </button>

              <button
                style={{
                  ...styles.navButton,
                  ...(activePage === "documents" ? styles.activeButton : {}),
                }}
                onClick={() => setActivePage("documents")}
              >
                Dokumente
              </button>

              <button
                style={{
                  ...styles.navButton,
                  ...(activePage === "coverLetters" ? styles.activeButton : {}),
                }}
                onClick={() => setActivePage("coverLetters")}
              >
                Anschreiben
              </button>
            </div>

            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <p style={styles.breadcrumb}>Job Tracker</p>
          <h1 style={styles.pageTitle}>{getPageTitle()}</h1>
        </div>

        <section style={styles.pageContent}>
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "applications" && <Applications />}
          {activePage === "documents" && <Documents />}
          {activePage === "coverLetters" && <CoverLetters />}
        </section>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },
  header: {
    background: "#111827",
    color: "#ffffff",
    borderBottom: "1px solid #1f2937",
  },
  headerInner: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "18px 24px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "24px",
  },
  logo: {
    display: "block",
    fontSize: "22px",
    letterSpacing: "0.2px",
  },
  logoSubtitle: {
    margin: "4px 0 0",
    color: "#9ca3af",
    fontSize: "14px",
  },
  nav: {
    display: "contents",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  navButton: {
    padding: "9px 13px",
    border: "1px solid #374151",
    borderRadius: "999px",
    background: "transparent",
    color: "#e5e7eb",
    fontWeight: "bold",
    cursor: "pointer",
  },
  activeButton: {
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
  },
  logoutButton: {
    justifySelf: "end",
    padding: "9px 13px",
    border: "1px solid #ef4444",
    borderRadius: "999px",
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  main: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "32px 24px 48px",
  },
  pageHeader: {
    marginBottom: "24px",
  },
  breadcrumb: {
    margin: "0 0 6px",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  pageTitle: {
    margin: 0,
    fontSize: "34px",
    lineHeight: "1.2",
  },
  pageContent: {
    display: "grid",
    gap: "24px",
  },
};

export default App;