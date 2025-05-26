import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
} from "@mui/material";
import { db, collection, getDocs, query, where } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import UserNavbar from "./UserNavbar";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import EventIcon from "@mui/icons-material/Event";

const RegisteredEvents = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchRegisteredEvents();
  }, []);

  useEffect(() => {
    sortEvents(sortBy);
  }, [sortBy]);

  const fetchRegisteredEvents = async () => {
    const q = query(collection(db, "registered_events"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const eventIds = querySnapshot.docs.map((doc) => doc.data().eventId);

    const eventsList = [];
    for (let eventId of eventIds) {
      const eventQuery = await getDocs(
        query(collection(db, "events"), where("__name__", "==", eventId))
      );
      eventsList.push(...eventQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    const sorted = sortEvents(sortBy, eventsList);
    setRegisteredEvents(sorted);
  };

  const sortEvents = (sortType, events = registeredEvents) => {
    const sorted = [...events].sort((a, b) => {
      if (sortType === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortType === "date") {
        return new Date(a.date) - new Date(b.date); // Earliest first
      }
      return 0;
    });
    setRegisteredEvents(sorted);
    return sorted;
  };

  const handleSortChange = (event, newSort) => {
    if (newSort) setSortBy(newSort);
  };

  const isPastEvent = (eventDateStr) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const eventDate = new Date(eventDateStr).setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Navbar */}
      <UserNavbar />
      
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        My Registered Events
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        You’ve successfully registered for the following events. Stay updated!
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="medium">
          Sort by:
        </Typography>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={handleSortChange}
          aria-label="sort toggle"
          color="primary"
        >
          <ToggleButton value="name" aria-label="sort by name">
            <SortByAlphaIcon sx={{ mr: 1 }} /> Name
          </ToggleButton>
          <ToggleButton value="date" aria-label="sort by date">
            <EventIcon sx={{ mr: 1 }} /> Date
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 950 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Event Name</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Location</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registeredEvents.map((event) => {
                const isPast = isPastEvent(event.date);
                return (
                  <TableRow
                    key={event.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f0f4ff",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={isPast ? "Past" : "Upcoming"}
                        color={isPast ? "default" : "success"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisteredEvents;
