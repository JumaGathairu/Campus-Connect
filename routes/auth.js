const express = require("express");
const router = express.Router();
const { signup, deleteUser, addUser } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authenticateUser");
const { adminAuth } = require("../middlewares/adminAuth");
const { setAdminRole } = require("../controllers/setAdminRole");

// Signup User
router.post("/signup", signup);

// Delete User (Admin Only)
router.delete("/delete-user/:uid", authenticateUser, adminAuth, deleteUser);

// Add User (Admin Only)
router.post("/add-user", authenticateUser, adminAuth, addUser);

// Set admin role 
router.post("/setAdmin", setAdminRole);

module.exports = router;
