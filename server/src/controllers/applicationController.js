const prisma = require("../lib/prisma");

exports.getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId },
      include: {
        applicationDocuments: {
          include: {
            document: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(applications);
  } catch (error) {
    console.error("GET_APPLICATIONS_ERROR", error);
    return res.status(500).json({
      error: "Bewerbungen konnten nicht geladen werden",
    });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const {
      company,
      position,
      status,
      jobUrl,
      notes,
      coverLetterId,
      documentIds,
    } = req.body;

    if (!company || !position) {
      return res.status(400).json({
        error: "Firma und Position sind erforderlich",
      });
    }

    let coverLetterSnapshot = null;

    if (coverLetterId) {
      const coverLetter = await prisma.coverLetter.findFirst({
        where: {
          id: coverLetterId,
          userId: req.user.userId,
        },
      });

      if (!coverLetter) {
        return res.status(404).json({
          error: "Anschreiben nicht gefunden",
        });
      }

      coverLetterSnapshot = coverLetter.content;
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.userId,
        company,
        position,
        status: status || "applied",
        jobUrl: jobUrl || null,
        notes: notes || null,
        coverLetterId: coverLetterId || null,
        coverLetterSnapshot,
        applicationDocuments: {
          create: Array.isArray(documentIds)
            ? documentIds.map((documentId) => ({ documentId }))
            : [],
        },
      },
      include: {
        applicationDocuments: {
          include: {
            document: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Bewerbung komplett erstellt",
      application,
    });
  } catch (error) {
    console.error("CREATE_APPLICATION_ERROR", error);
    return res.status(500).json({
      error: "Bewerbung konnte nicht erstellt werden",
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, status, jobUrl, notes } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Ungültige Bewerbungs-ID",
      });
    }

    if (!company || !position) {
      return res.status(400).json({
        error: "Firma und Position sind erforderlich",
      });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        error: "Bewerbung nicht gefunden",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        company,
        position,
        status: status || "applied",
        jobUrl: jobUrl || null,
        notes: notes || null,
      },
      include: {
        applicationDocuments: {
          include: {
            document: true,
          },
        },
      },
    });

    return res.json({
      message: "Bewerbung wurde aktualisiert",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("UPDATE_APPLICATION_ERROR", error);
    return res.status(500).json({
      error: "Bewerbung konnte nicht aktualisiert werden",
    });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Ungültige Bewerbungs-ID",
      });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        error: "Bewerbung nicht gefunden",
      });
    }

    await prisma.applicationDocument.deleteMany({
      where: {
        applicationId: id,
      },
    });

    await prisma.application.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Bewerbung wurde gelöscht",
    });
  } catch (error) {
    console.error("DELETE_APPLICATION_ERROR", error);
    return res.status(500).json({
      error: "Bewerbung konnte nicht gelöscht werden",
    });
  }
};