const { admin, db } = require("../config/firebaseConfig");

// Register a new user
const signup = async (req, res) => {
  try {
      const { email, password, name, isAdmin } = req.body; t

      if (!email || !password || !name) {
          return res.status(400).json({ error: "Email, password, and name are required" });
      }

      // Ensure the email belongs to KCAU domain
      if (!email.endsWith("@kcau.ac.ke")) {
          return res.status(403).json({ error: "Only KCAU emails are allowed" });
      }

      const userRecord = await admin.auth().createUser({ email, password, displayName: name });

      // Store user in Firestore with an admin flag
      await db.collection("users").doc(userRecord.uid).set({
          name,
          email,
          admin: isAdmin || false, 
          createdAt: new Date(),
      });

      res.status(201).json({ uid: userRecord.uid, message: "User registered successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().deleteUser(uid);
    await db.collection("users").doc(uid).delete();
    res.json({ message: `User with UID: ${uid} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add User
const addUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = { name, email, createdAt: new Date() };
    const docRef = await db.collection("users").add(newUser);
    res.status(201).json({ id: docRef.id, message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update(updateData);
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { signup, deleteUser, addUser };
