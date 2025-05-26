const { admin, db } = require("../config/firebaseConfig");

const setAdminRole = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    
    const user = await admin.auth().getUserByEmail(email);
    
    // Update Firestore to add admin role
    await db.collection("users").doc(user.uid).set({ role: "admin" }, { merge: true });

    res.json({ message: `Admin role assigned to ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { setAdminRole };
