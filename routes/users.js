const express = require("express");
const { getUserRegisteredEvents } = require("../controllers/usersController");
const router = express.Router();
const { db } = require("../config/firebaseConfig");

//  Get User Profile
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  View User's Registered Events
router.get("/:userId/registered-events", getUserRegisteredEvents);

module.exports = router;
