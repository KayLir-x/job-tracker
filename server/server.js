const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const { requireAuth } = require("./src/middleware/authMiddleware");
const profileRoutes = require("./src/routes/profileRoutes");
const coverLetterRoutes = require("./src/routes/coverLetterRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/cover-letters", coverLetterRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "Server Verbindung funktioniert" });
});

app.get("/api/protected", requireAuth, (req, res) => {
  res.json({
    message: "Geschützte Route funktioniert",
    user: req.user,
  });
});

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});