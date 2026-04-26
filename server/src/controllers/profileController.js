const prisma = require("../lib/prisma");

exports.getProfile = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.userId },
    });

    return res.json(profile);
  } catch (error) {
    console.error("GET_PROFILE_ERROR", error);
    return res.status(500).json({ error: "Profil konnte nicht geladen werden" });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const { address, phone, skills, cvText } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.userId },
      update: {
        address: address || null,
        phone: phone || null,
        skills: skills || null,
        cvText: cvText || null,
      },
      create: {
        userId: req.user.userId,
        address: address || null,
        phone: phone || null,
        skills: skills || null,
        cvText: cvText || null,
      },
    });

    return res.json({
      message: "Profil gespeichert",
      profile,
    });
  } catch (error) {
    console.error("SAVE_PROFILE_ERROR", error);
    return res.status(500).json({ error: "Profil konnte nicht gespeichert werden" });
  }
};