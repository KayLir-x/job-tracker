import { useState } from "react";

const API_URL = "http://localhost:5000/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login fehlgeschlagen");
      }

      localStorage.setItem("token", data.token);

      setMessage("Login erfolgreich.");

      onLogin();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <p style={styles.subtitle}>
          Melde dich an, um deine Bewerbungen zu verwalten.
        </p>

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>E-Mail</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="deine@email.de"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Passwort</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Dein Passwort"
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Login läuft..." : "Einloggen"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "28px",
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
};

export default Login;