const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middlewares/adminAuth");
const {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
  addClubUpdate,  
} = require("../controllers/clubsController");

// Club Routes
router.post("/", adminAuth, createClub); // Admin only
router.get("/", getAllClubs);
router.get("/:id", getClubById);
router.put("/:id", adminAuth, updateClub); // Admin only
router.delete("/:id", adminAuth, deleteClub); // Admin only
router.post("/:id/update", adminAuth, addClubUpdate); // Admin only

module.exports = router;
