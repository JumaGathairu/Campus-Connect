const { admin } = require("./config/firebaseConfig");

const checkAdminUser = async () => {
  try {
    const userRecord = await admin.auth().getUserByEmail("admin@kcau.ac.ke");
    console.log("Admin User Found:", userRecord.toJSON());
  } catch (error) {
    console.error("Admin User Not Found or Error:", error.message);
  }
};

checkAdminUser();
