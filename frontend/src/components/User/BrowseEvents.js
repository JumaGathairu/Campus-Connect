import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { db, collection, getDocs, addDoc, query, where } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import UserNavbar from "./UserNavbar";
import "react-toastify/dist/ReactToastify.css";

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchEvents();
      fetchRegisteredEventIds();
    }
  }, [user]);

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const eventsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by date
    const sorted = eventsList.sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );
    setEvents(sorted);
  };

  const fetchRegisteredEventIds = async () => {
    const q = query(collection(db, "registered_events"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const ids = snapshot.docs.map((doc) => doc.data().eventId);
    setRegisteredEventIds(ids);
  };

  const handleRegister = async () => {
    if (!selectedEvent) return;

    try {
      await addDoc(collection(db, "registered_events"), {
        userId: user.uid,
        eventId: selectedEvent,
      });
      toast.success("Registered successfully!");
      setRegisteredEventIds((prev) => [...prev, selectedEvent]);
      setOpenDialog(false);
    } catch (error) {
      toast.error("Error registering for event.");
    }
  };

  const handleDialogOpen = (eventId) => {
    setSelectedEvent(eventId);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 5, pb: 5 }}>
      <UserNavbar />

      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Browse Events
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Event Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      <EventAvailableIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      <AccessTimeIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                      Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      <LocationOnIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                      Location
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => {
                    const alreadyRegistered = registeredEventIds.includes(event.id);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>{event.time}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={alreadyRegistered}
                            onClick={() => handleDialogOpen(event.id)}
                            sx={{ textTransform: "none" }}
                          >
                            {alreadyRegistered ? "Registered" : "Register"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Registration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to register for this event?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRegister} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowseEvents;
