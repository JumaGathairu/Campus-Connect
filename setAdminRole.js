const { admin } = require("./config/firebaseConfig");

const setAdminRole = async () => {
  try {
    const user = await admin.auth().getUserByEmail("admin@kcau.ac.ke");
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(" Admin role assigned successfully.");
  } catch (error) {
    console.error(" Error assigning admin role:", error.message);
  }
};

setAdminRole();
