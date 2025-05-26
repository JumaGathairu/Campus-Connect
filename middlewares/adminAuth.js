const { admin, db } = require("../config/firebaseConfig");

const adminAuth = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1]; // Get token

    if (!idToken) {
      return res.status(403).json({ error: "Unauthorized. No token provided" });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check if the user is an admin in Firestore
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Unauthorized. Admin access required" });
    }

    req.user = decodedToken; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { adminAuth };
