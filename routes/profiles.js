const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const db = admin.firestore();

//  Create Profile
router.post("/", async (req, res) => {
  try {
    const { uid, name, email, bio } = req.body;
    if (!uid || !name || !email || !bio) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await db.collection("profiles").doc(uid).set({
      name,
      email,
      bio,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Read Profile by UID
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const profileDoc = await db.collection("profiles").doc(uid).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ id: profileDoc.id, ...profileDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    await db.collection("profiles").doc(uid).update(updates);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Profile
router.delete("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    await db.collection("profiles").doc(uid).delete();
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
