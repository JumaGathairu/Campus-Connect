import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "../../config/firebaseConfig";
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { toast } from "react-toastify";
import Navbar from "./Navbar";

const ManageClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    contactInfo: { email: "", phone: "" }, 
    updates: "" 
  });
  const [editingId, setEditingId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // Confirmation dialog for delete/edit
  const [actionType, setActionType] = useState(null); // Track whether the action is 'edit' or 'delete'

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    setClubs(querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      contactInfo: doc.data().contactInfo || {},  // Ensure contactInfo is always defined
      updates: doc.data().updates || [] // Ensure updates are always defined
    })));
  };

  const handleAddOrUpdate = async () => {
    const { name, description, contactInfo, updates } = form;

    if (!name || !description || !contactInfo.email || !contactInfo.phone) {
      toast.error("All fields are required (name, description, contact email, and phone)");
      return;
    }

    try {
      if (editingId) {
        // Set the action type to edit and open the confirmation dialog
        setActionType("edit");
        setConfirmDialogOpen(true);
      } else {
        // Create new club if not editing
        await addDoc(collection(db, "clubs"), { 
          ...form, 
          updates: updates ? [updates] : [],  
          createdAt: new Date() 
        });
        toast.success("Club created successfully!");
        setOpen(false);
        fetchClubs();
      }
    } catch (error) {
      toast.error("An error occurred while adding/updating the club.");
    }
  };

  const confirmEdit = async () => {
    try {
      await updateDoc(doc(db, "clubs", editingId), { ...form, updates: form.updates.split("\n") });
      toast.success("Club updated successfully!");
      setOpen(false);
      setEditingId(null);
      fetchClubs();
      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error("Error updating club!");
      setConfirmDialogOpen(false);
    }
  };

  const handleDelete = (id) => {
    setActionType("delete");
    setEditingId(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Perform the deletion
      await deleteDoc(doc(db, "clubs", editingId));
      toast.success("Club deleted successfully!");
      fetchClubs();
      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error("Error deleting club!");
      setConfirmDialogOpen(false);
    }
  };

  const handleEdit = (club) => {
    setForm({
      name: club.name, 
      description: club.description, 
      contactInfo: club.contactInfo, 
      updates: club.updates.join("\n")  
    });
    setEditingId(club.id);
    setOpen(true);
  };

  const cancelAction = () => {
    setConfirmDialogOpen(false); // Close the confirmation dialog without action
  };

  return (
    <Container>
      {/* Navbar */}
      <Navbar />
      
      {/* Manage Clubs Title */}
      <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>Manage Clubs</Typography>
      
      {/* Create New Club Button */}
      <Button variant="contained" color="primary" sx={{ marginBottom: 3 }}
       onClick={() => {
        setForm({ name: "", description: "", contactInfo: { email: "", phone: "" }, updates: "" }); // Reset form
        setEditingId(null); // Ensure it's a new creation, not editing
        setOpen(true); 
       }}
      >
        Create New Club
      </Button>

      {/* Clubs Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Updates</TableCell> 
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clubs.map((club) => (
            <TableRow key={club.id}>
              <TableCell>{club.name}</TableCell>
              <TableCell>{club.description}</TableCell>
              {/* Ensure contactInfo is defined before accessing its properties */}
              <TableCell>{club.contactInfo?.email || 'N/A'}</TableCell>
              <TableCell>{club.contactInfo?.phone || 'N/A'}</TableCell>
              <TableCell>{club.updates?.join(", ") || 'No updates'}</TableCell> 
              <TableCell>
                <Button onClick={() => handleEdit(club)} variant="contained" color="primary" sx={{ marginRight: 1 }}>
                  Edit
                </Button>
                <Button onClick={() => handleDelete(club.id)} variant="contained" color="secondary">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Club Creation / Editing Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? "Edit Club" : "Create Club"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={form.contactInfo.email}
            onChange={(e) => setForm({ ...form, contactInfo: { ...form.contactInfo, email: e.target.value } })}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={form.contactInfo.phone}
            onChange={(e) => setForm({ ...form, contactInfo: { ...form.contactInfo, phone: e.target.value } })}
          />
          {editingId && (  // Only show updates field when editing
            <TextField
              label="Updates"
              fullWidth
              margin="normal"
              value={form.updates}
              onChange={(e) => setForm({ ...form, updates: e.target.value })}
              multiline
              rows={4}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="default">Cancel</Button>
          <Button onClick={handleAddOrUpdate} color="primary">
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete / Edit */}
      <Dialog open={confirmDialogOpen} onClose={cancelAction}>
        <DialogTitle>
          {actionType === "delete" ? "Confirm Deletion" : "Confirm Edit"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === "delete" ? "Are you sure you want to delete this club?" : "Are you sure you want to update this club?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAction} color="default">Cancel</Button>
          <Button onClick={actionType === "delete" ? confirmDelete : confirmEdit} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageClubs;