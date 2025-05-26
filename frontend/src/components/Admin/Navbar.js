import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={3} sx={{ backgroundColor: "#1a237e" }}>
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        {/* Left: Brand */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <AdminPanelSettingsIcon fontSize="large" />
          <Typography variant="h6" component="div" fontWeight="bold">
            KCAU Campus Admin
          </Typography>
        </Stack>

        {/* Right: Navigation Links */}
        <Box>
          <Button color="inherit" onClick={() => navigate("/admin-dashboard")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate("/admin/manage-events")}>
            Manage Events
          </Button>
          <Button color="inherit" onClick={() => navigate("/admin/manage-clubs")}>
            Manage Clubs
          </Button>
          <Button
            color="error"
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
