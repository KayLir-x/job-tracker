
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");

exports.getDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(documents);
  } catch (error) {
    console.error("GET_DOCUMENTS_ERROR", error);
    return res.status(500).json({
      error: "Dokumente konnten nicht geladen werden",
    });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({
        error: "Titel muss mindestens 2 Zeichen haben",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Bitte eine Datei auswählen",
      });
    }

    const document = await prisma.document.create({
      data: {
        userId: req.user.userId,
        title: title.trim(),
        category: category && category.trim() ? category.trim() : null,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });

    return res.status(201).json({
      message: "Dokument erfolgreich hochgeladen",
      document,
    });
  } catch (error) {
    console.error("UPLOAD_DOCUMENT_ERROR", error);
    return res.status(500).json({
      error: "Dokument konnte nicht hochgeladen werden",
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Ungültige Dokument-ID",
      });
    }

    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingDocument) {
      return res.status(404).json({
        error: "Dokument wurde nicht gefunden",
      });
    }

    await prisma.applicationDocument.deleteMany({
      where: {
        documentId: id,
      },
    });

    await prisma.document.delete({
      where: {
        id,
      },
    });

    if (existingDocument.fileName) {
      const filePath = path.join(
        __dirname,
        "../../uploads",
        existingDocument.fileName
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.json({
      message: "Dokument wurde gelöscht",
    });
  } catch (error) {
    console.error("DELETE_DOCUMENT_ERROR", error);
    return res.status(500).json({
      error: "Dokument konnte nicht gelöscht werden",
    });
  }
};