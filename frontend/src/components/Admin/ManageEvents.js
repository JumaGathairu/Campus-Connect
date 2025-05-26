import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "../../config/firebaseConfig";
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { toast } from "react-toastify";
import Navbar from "./Navbar";  
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

const ManageEvents = () => {
  const resetForm = () => {
    setForm({ name: "", date: "", time: "", location: "" });
    setEditingId(null);
  };

  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", time: "", location: "" });
  const [editingId, setEditingId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); 
  const [actionType, setActionType] = useState(null); // Track whether the action is 'edit' or 'delete'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const eventsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEvents(eventsList);
  };

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.date || !form.location || !form.time) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const formattedDate = format(form.date, 'yyyy-MM-dd'); 
      const formattedTime = format(form.time, 'hh:mm a'); 

      const eventData = {
        name: form.name,
        date: formattedDate,
        time: formattedTime, 
        location: form.location,
      };

      if (editingId) {
        // Update event if editing an existing event
        await updateDoc(doc(db, "events", editingId), eventData);
        toast.success("Event updated successfully!");
      } else {
        // Create new event if not editing
        await addDoc(collection(db, "events"), eventData);
        toast.success("Event created successfully!");
      }
      setOpen(false);
      resetForm(); // Reset the form properly
      await fetchEvents(); // Refresh events
    } catch (error) {
      toast.error("An error occurred while adding/updating the event.");
    }
  };

  const handleDelete = async (id) => {
    // Open confirmation dialog for delete
    setActionType("delete");
    setEditingId(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "events", editingId));
      toast.success("Event deleted successfully!");
      fetchEvents();
      resetForm(); 
      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error("Error deleting event!");
    }
  };

  const handleEdit = (event) => {
    setForm(event);
    setEditingId(event.id);
    setOpen(true);
    setActionType("edit");
  };

  const confirmEdit = async () => {
    handleAddOrUpdate();
    resetForm(); // Reset form after confirmation
    setConfirmDialogOpen(false);
  };

  const cancelAction = () => {
    setConfirmDialogOpen(false);
    setEditingId(null);
    setActionType(null);
    resetForm(); 
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetForm(); 
  };

  return (
    <Container>
      {/* Navbar */}
      <Navbar />
      
      {/* Manage Events Title */}
      <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>Manage Events</Typography>
      
      {/* Create New Event Button */}
      <Button variant="contained" color="primary" sx={{ marginBottom: 3 }} onClick={() => setOpen(true)}>
        Create New Event
      </Button>

      {/* Events Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.name}</TableCell>
              <TableCell>{event.date}</TableCell>
              <TableCell>{event.time}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(event)} variant="contained" color="primary" sx={{ marginRight: 1 }}>
                  Edit
                </Button>
                <Button onClick={() => handleDelete(event.id)} variant="contained" color="secondary">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Event Creation / Editing Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Event Date"
              value={form.date}
              onChange={(newDate) => setForm({ ...form, date: newDate })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
            <TimePicker
              label="Event Time"
              value={form.time}
              onChange={(newTime) => setForm({ ...form, time: newTime })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="default">Cancel</Button>
          <Button
            onClick={() => {
              if (editingId) {
                setOpen(false); 
                setActionType("edit");
                setConfirmDialogOpen(true);
              } else {
                handleAddOrUpdate();
              }
            }}
            color="primary"
          >
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
            {actionType === "delete" ? "Are you sure you want to delete this event?" : "Are you sure you want to update this event?"}
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

export default ManageEvents;
