import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserNavbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#0d47a1" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            KCAU Campus Connect
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/user/events">
              Events
            </Button>
            <Button color="inherit" component={Link} to="/user/clubs">
              Clubs
            </Button>
            <Button color="inherit" component={Link} to="/user/registered-events">
              My Events
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default UserNavbar;
