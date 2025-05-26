const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebaseConfig");
const { adminAuth } = require("../middlewares/adminAuth");

// Create Events (Admin Only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, date, location, description } = req.body;

    if (!name || !date || !location || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const newEvent = { name, date, location, description, createdAt: new Date() };
    const docRef = await db.collection("events").add(newEvent);

    console.log(` Event created: ${docRef.id}`);

    res.status(201).json({ id: docRef.id, message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: error.message });
  }
});

//  Read All Events
router.get("/", async (req, res) => {
  try {
    const eventsSnapshot = await db.collection("events").orderBy("date").get();
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(` Fetched ${events.length} events`);

    res.status(200).json(events);
  } catch (error) {
    console.error(" Error fetching events:", error);
    res.status(500).json({ error: error.message });
  }
});

//  Update Events (Admin Only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, time, location, description } = req.body;

    console.log(`🔄 Updating event: ${id}`);

    const eventRef = db.collection("events").doc(id);
    const event = await eventRef.get();

    if (!event.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    if (time && !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM (24-hour format)" });
    }

    await eventRef.update({ name, date, time, location, description });

    console.log(` Event updated: ${id}`);

    res.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error(" Error updating event:", error);
    res.status(500).json({ error: error.message });
  }
});

//  Delete Event (Admin Only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const eventRef = db.collection("events").doc(id);
    const event = await eventRef.get();

    if (!event.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    await eventRef.delete();

    console.log(` Event deleted: ${id}`);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(" Error deleting event:", error);
    res.status(500).json({ error: error.message });
  }
});

//  User Event Registration
router.post("/:id/register", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(`🔹 Registering user: ${userId} for event: ${id}`);

    // Fetch event list for debugging
    const eventsSnapshot = await db.collection("events").get();
    const eventIds = eventsSnapshot.docs.map(doc => doc.id);

    if (!eventIds.includes(id)) {
      console.error(` Event not found: ${id}`);
      console.log(" Available event IDs:", eventIds);
      return res.status(404).json({ error: "Event not found" });
    }

    const eventRef = db.collection("events").doc(id);
    const event = await eventRef.get();

    if (!event.exists) {
      console.error(` Event not found: ${id}`);
      return res.status(404).json({ error: "Event not found" });
    }

    const userRef = db.collection("users").doc(userId);
    const user = await userRef.get();

    if (!user.exists) {
      console.error(` User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already registered
    const registrationRef = eventRef.collection("registrations").doc(userId);
    if ((await registrationRef.get()).exists) {
      console.warn(` User already registered: ${userId} for event: ${id}`);
      return res.status(400).json({ error: "User already registered for this event" });
    }

    // Register user for the event
    await registrationRef.set({
      userId,
      registeredAt: new Date(),
    });

    console.log(`User registered successfully: ${userId} for event: ${id}`);

    res.status(201).json({ message: "User registered successfully for the event" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Events A User Has Registered For
router.get("/users/:userId/registered-events", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Fetching registered events for user: ${userId}`);

    // Query all events
    const eventsSnapshot = await db.collection("events").get();
    const registeredEvents = [];

    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      const registrationRef = db.collection("events").doc(eventId).collection("registrations").doc(userId);
      const registration = await registrationRef.get();

      if (registration.exists) {
        const eventData = eventDoc.data();
        registeredEvents.push({ id: eventId, date: eventData.date, time: eventData.time, ...eventData });
      }
    }

    console.log(`User ${userId} is registered for ${registeredEvents.length} events`);

    res.status(200).json(registeredEvents);
  } catch (error) {
    console.error("Error fetching registered events:", error);
    res.status(500).json({ error: error.message });
  }
});

//  User Event Deregistration
router.delete("/:eventId/deregister", async (req, res) => {
  try {
    const { eventId } = req.params;  // Get the event ID from URL params
    const { userId } = req.body;  // Get the user ID from the request body

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(`🔹 Deregistering user: ${userId} from event: ${eventId}`);

    // Fetch event to ensure it exists
    const eventRef = db.collection("events").doc(eventId);
    const event = await eventRef.get();

    if (!event.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Fetch user to ensure they exist
    const userRef = db.collection("users").doc(userId);
    const user = await userRef.get();

    if (!user.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is registered for the event
    const registrationRef = eventRef.collection("registrations").doc(userId);
    const registration = await registrationRef.get();

    if (!registration.exists) {
      return res.status(400).json({ error: "User not registered for this event" });
    }

    // Deregister user by deleting their registration
    await registrationRef.delete();

    console.log(`User deregistered successfully: ${userId} from event: ${eventId}`);

    res.json({ message: "User deregistered successfully from the event" });
  } catch (error) {
    console.error("Error deregistering user:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
