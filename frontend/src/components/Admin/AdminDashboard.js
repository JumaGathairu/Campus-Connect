import React, { useEffect, useState } from "react";
import { db, collection, getDocs, query, orderBy, limit } from "../../config/firebaseConfig";
import { Container, Typography, Grid, Card, CardContent, Paper, Button, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import { format } from "date-fns";
import Navbar from "./Navbar";
import { useTheme } from "@mui/material/styles";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [totalUsers, setTotalUsers] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    fetchUpcomingEvents();
  }, []);

  const fetchStats = async () => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const eventsSnapshot = await getDocs(collection(db, "events"));

    const upcoming = eventsSnapshot.docs.filter(doc => {
      const data = doc.data();
      const eventDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      return eventDate && eventDate > new Date(); // Compare with the current date
    });

    setTotalUsers(usersSnapshot.size);
    setUpcomingEventsCount(upcoming.length);
  };

  const fetchRecentActivity = async () => {
    const clubsSnapshot = await getDocs(query(collection(db, "clubs"), orderBy("createdAt", "desc"), limit(5)));
    const eventsSnapshot = await getDocs(query(collection(db, "events"), orderBy("updatedAt", "desc"), limit(5)));

    const clubActivities = clubsSnapshot.docs.map(doc => ({
      type: "Club",
      name: doc.data().name,
      time: doc.data().createdAt?.toDate(),
    }));

    const eventActivities = eventsSnapshot.docs.map(doc => ({
      type: "Event",
      name: doc.data().title,
      time: doc.data().updatedAt?.toDate(),
    }));

    const combined = [...clubActivities, ...eventActivities]
      .filter(item => item.time)
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);

    setRecentActivity(combined);
  };

  const fetchUpcomingEvents = async () => {
    const snapshot = await getDocs(query(collection(db, "events"), orderBy("date", "asc")));
    const upcoming = snapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }))
      .filter(event => {
        const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
        const now = new Date();
        const sevenDaysLater = new Date(now.setDate(now.getDate() + 7));
        return eventDate > new Date() && eventDate <= sevenDaysLater;
      })
      .slice(0, 5);
    setUpcomingEvents(upcoming);
    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Navbar />
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Welcome, Admin!
      </Typography>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#E3F2FD",
            borderLeft: "6px solid #1A237E",
          }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Registered Users
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {totalUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#FFF8E1",
            borderLeft: "6px solid #D4AF37",
          }}>
            <Typography variant="subtitle1" color="text.secondary">
              All Upcoming Events
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="secondary">
              {upcomingEventsCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Events Preview */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" fontWeight="medium" color="text.primary" sx={{ mb: 2 }}>
          Upcoming Events (Next 7 Days)
        </Typography>

        {upcomingEvents.length === 0 ? (
          <Typography>No events scheduled in the upcoming week.</Typography>
        ) : (
          <Grid container spacing={2}>
            {upcomingEvents.map((event) => {
              const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
              return (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Card
                    sx={{
                      borderLeft: "6px solid #1976D2",
                      borderRadius: 3,
                      backgroundColor: "#f5faff",
                      boxShadow: 2,
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        {event.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {format(eventDate, "MMM dd, yyyy")} at {event.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location: {event.location}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Call to Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 2 }}
            onClick={() => navigate("/admin/manage-events")}
          >
            Manage Events
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            sx={{ py: 2 }}
            onClick={() => navigate("/admin/manage-clubs")}
          >
            Manage Clubs
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
