

const prisma = require("../lib/prisma");

exports.getCoverLetters = async (req, res) => {
  try {
    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(coverLetters);
  } catch (error) {
    console.error("GET_COVER_LETTERS_ERROR", error);
    return res.status(500).json({
      error: "Anschreiben konnten nicht geladen werden",
    });
  }
};

exports.createCoverLetter = async (req, res) => {
  try {
    const { title, content, industry } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Titel und Inhalt sind erforderlich",
      });
    }

    if (content.length < 20) {
      return res.status(400).json({
        error: "Inhalt muss mindestens 20 Zeichen haben",
      });
    }

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: req.user.userId,
        title,
        content,
        industry: industry || null,
      },
    });

    return res.status(201).json({
      message: "Anschreiben gespeichert",
      coverLetter,
    });
  } catch (error) {
    console.error("CREATE_COVER_LETTER_ERROR", error);
    return res.status(500).json({
      error: "Anschreiben konnte nicht gespeichert werden",
    });
  }
};

exports.updateCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, industry } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Titel und Inhalt sind erforderlich",
      });
    }

    if (content.length < 20) {
      return res.status(400).json({
        error: "Inhalt muss mindestens 20 Zeichen haben",
      });
    }

    const existingCoverLetter = await prisma.coverLetter.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingCoverLetter) {
      return res.status(404).json({
        error: "Anschreiben wurde nicht gefunden",
      });
    }

    const updatedCoverLetter = await prisma.coverLetter.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        industry: industry || null,
      },
    });

    return res.json({
      message: "Anschreiben aktualisiert",
      coverLetter: updatedCoverLetter,
    });
  } catch (error) {
    console.error("UPDATE_COVER_LETTER_ERROR", error);
    return res.status(500).json({
      error: "Anschreiben konnte nicht aktualisiert werden",
    });
  }
};

exports.deleteCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCoverLetter = await prisma.coverLetter.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingCoverLetter) {
      return res.status(404).json({
        error: "Anschreiben wurde nicht gefunden",
      });
    }

    await prisma.coverLetter.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Anschreiben gelöscht",
    });
  } catch (error) {
    console.error("DELETE_COVER_LETTER_ERROR", error);
    return res.status(500).json({
      error: "Anschreiben konnte nicht gelöscht werden",
    });
  }
};