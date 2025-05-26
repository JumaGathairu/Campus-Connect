import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import { db, collection, getDocs, doc, getDoc } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

const Dashboard = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEventsCount, setRegisteredEventsCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      fetchUserName(user.uid);
      fetchStats(user.uid);
      fetchUpcomingEvents();
    }
  }, [user]);

  const fetchUserName = async (uid) => {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        setUserName(docSnap.data().name || "User");
      }
    } catch (error) {
      console.error("Failed to fetch user name:", error);
    }
  };

  const fetchStats = async (uid) => {
    try {
      const regSnap = await getDocs(collection(db, "registered_events"));
      const allRegistered = regSnap.docs.filter(doc => doc.data().userId === uid);
      setRegisteredEventsCount(allRegistered.length);

      const eventsSnap = await getDocs(collection(db, "events"));
      const today = dayjs();
      const next7 = today.add(7, "day");

      const upcoming = eventsSnap.docs.filter(doc => {
        const eventDate = dayjs(doc.data().date, "YYYY-MM-DD");
        return eventDate.isAfter(today.subtract(1, "day")) && eventDate.isBefore(next7.add(1, "day"));
      });

      setUpcomingCount(upcoming.length);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const today = dayjs().startOf("day");
      const in7Days = today.add(7, "day").endOf("day");

      const upcoming = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const eventDate = dayjs(data.date, "YYYY-MM-DD");
          const isUpcoming = eventDate.isSameOrAfter(today) && eventDate.isBefore(in7Days);
          return isUpcoming ? { id: doc.id, ...data } : null;
        })
        .filter(Boolean)
        .sort((a, b) =>
          dayjs(a.date, "YYYY-MM-DD").diff(dayjs(b.date, "YYYY-MM-DD"))
        );

      setUpcomingEvents(upcoming.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error);
    }
  };

  return (
    <>
      <UserNavbar />
      <Container sx={{ mt: 5 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Welcome, {userName}!
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
                My Registered Events
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {registeredEventsCount}
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
                All Upcoming Events (Next 7 Days)
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary">
                {upcomingCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Upcoming Events Preview */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight="medium" color="text.primary" sx={{ mb: 2 }}>
            My Upcoming Events in the Next 7 Days
          </Typography>

          {upcomingEvents.length === 0 ? (
            <Typography>No events scheduled in the upcoming week.</Typography>
          ) : (
            <Grid container spacing={2}>
              {upcomingEvents.map((event) => (
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
                        {dayjs(event.date).format("MMM DD, YYYY")} at {event.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location: {event.location}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
              onClick={() => navigate("/user/clubs")}
            >
              Discover New Clubs
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              sx={{ py: 2 }}
              onClick={() => navigate("/user/events")}
            >
              Register for More Events
            </Button>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;