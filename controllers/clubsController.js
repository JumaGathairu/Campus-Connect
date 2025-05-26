const { db } = require("../config/firebaseConfig");

// Create CLUB (Admin Only)
const createClub = async (req, res) => {
  try {
    const { name, description, contactInfo } = req.body;

    if (!name || !description || !contactInfo || !contactInfo.email || !contactInfo.phone) {
      return res.status(400).json({ error: "All fields are required (name, description, contact email, and phone)" });
    }

    const newClub = { 
      name, 
      description, 
      contactInfo, 
      updates: [], 
      createdAt: new Date() 
    };
    const docRef = await db.collection("clubs").add(newClub);

    res.status(201).json({ id: docRef.id, message: "Club created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get All Clubs
const getAllClubs = async (req, res) => {
  try {
    const clubsSnapshot = await db.collection("clubs").orderBy("name").get();
    const clubs = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get A Single Club By Id
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const clubRef = db.collection("clubs").doc(id);
    const club = await clubRef.get();

    if (!club.exists) {
      return res.status(404).json({ error: "Club not found" });
    }

    res.status(200).json({ id: club.id, ...club.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Club (Admin Only)
const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contactInfo } = req.body;

    const clubRef = db.collection("clubs").doc(id);
    const club = await clubRef.get();

    if (!club.exists) {
      return res.status(404).json({ error: "Club not found" });
    }

    await clubRef.update({ name, description, contactInfo });

    res.json({ message: "Club updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Club (Admin Only)
const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const clubRef = db.collection("clubs").doc(id);

    if (!(await clubRef.get()).exists) {
      return res.status(404).json({ error: "Club not found" });
    }

    await clubRef.delete();
    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update A Club (Admin Only)
const addClubUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateMessage } = req.body;

    if (!updateMessage) {
      return res.status(400).json({ error: "Update message is required" });
    }

    const clubRef = db.collection("clubs").doc(id);
    const club = await clubRef.get();

    if (!club.exists) {
      return res.status(404).json({ error: "Club not found" });
    }

    const existingUpdates = club.data().updates || [];
    existingUpdates.push({ message: updateMessage, date: new Date() });

    await clubRef.update({ updates: existingUpdates });

    res.json({ message: "Update added successfully" });
  } catch (error) {
    console.error("Error adding club update:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
  addClubUpdate,
};
