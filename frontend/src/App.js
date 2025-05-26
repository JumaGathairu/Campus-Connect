import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./config/theme";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageEvents from "./components/Admin/ManageEvents";
import ManageClubs from "./components/Admin/ManageClubs";
import Dashboard from "./components/User/Dashboard";
import BrowseEvents from "./components/User/BrowseEvents";
import RegisteredEvents from "./components/User/RegisteredEvents";
import BrowseClubs from "./components/User/BrowseClubs"; 
import MyClubs from "./components/User/MyClubs";  
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin-dashboard"
            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/manage-events"
            element={<ProtectedRoute adminOnly><ManageEvents /></ProtectedRoute>}
          />
          <Route
            path="/admin/manage-clubs"
            element={<ProtectedRoute adminOnly><ManageClubs /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/user/events"
            element={<ProtectedRoute><BrowseEvents /></ProtectedRoute>}
          />
          <Route
            path="/user/registered-events"
            element={<ProtectedRoute><RegisteredEvents /></ProtectedRoute>}
          />
          <Route
            path="/user/clubs"
            element={<ProtectedRoute><BrowseClubs /></ProtectedRoute>}  
          />
          <Route
            path="/user/my-clubs"
            element={<ProtectedRoute><MyClubs /></ProtectedRoute>}  
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
