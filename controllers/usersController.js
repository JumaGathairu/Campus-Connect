const { db } = require("../config/firebaseConfig");

const getUserRegisteredEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(` Fetching registered events for user: ${userId}`);

    const userRef = db.collection("users").doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      console.warn(` User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    
    console.log(" Firestore connected. Querying collectionGroup('registrations')...");

    
    const registrationsSnapshot = await db
      .collectionGroup("registrations")
      .where("userId", "==", userId)
      .orderBy("userId") 
      .orderBy("eventId") 
      .get();

    
    console.log(` Query executed. Found ${registrationsSnapshot.size} registrations for user ${userId}.`);

    if (registrationsSnapshot.empty) {
      console.log(`No registered events found for user: ${userId}`);
      return res.status(200).json([]);
    }

    console.log("🔄 Fetching event details...");

    // Fetch event details
    const registeredEvents = await Promise.all(
      registrationsSnapshot.docs.map(async (doc) => {
        console.log(` Processing registration: ${doc.id}`);

        const eventRef = doc.ref.parent.parent; 
        if (!eventRef) {
          console.warn(" Event reference not found for a registration.");
          return null;
        }

        const eventSnapshot = await eventRef.get();
        if (!eventSnapshot.exists) {
          console.warn(` Event not found for ID: ${eventRef.id}`);
          return null;
        }

        console.log(`Event found: ${eventSnapshot.id}`);
        return { id: eventSnapshot.id, ...eventSnapshot.data() };
      })
    );

    // Remove null values
    const validEvents = registeredEvents.filter((event) => event !== null);

    console.log(`Returning ${validEvents.length} events for user ${userId}`);
    res.status(200).json(validEvents);
  } catch (error) {
    console.error("Error fetching registered events:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserRegisteredEvents };
