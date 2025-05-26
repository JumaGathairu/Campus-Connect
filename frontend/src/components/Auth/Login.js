import React, { useState } from "react";
import { auth, db, signInWithEmailAndPassword, getDoc, doc } from "../../config/firebaseConfig"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, TextField, Button, Typography, Paper, Container } from "@mui/material";
import { styled } from "@mui/system";

// Styled Components
const Background = styled(Box)({
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to right, #1A237E, #D4AF37)", 
});

const LoginCard = styled(Paper)({
  padding: "40px",
  maxWidth: "400px",
  textAlign: "center",
  borderRadius: "12px",
});

const Logo = styled("img")({
  width: "80px",
  marginBottom: "20px",
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@kcau.ac.ke")) {
      toast.error("Only kcau.ac.ke emails are allowed.");
      return;

    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid)); 
      const userData = userDoc.data();
      toast.success("Login successful!");

      // Check if the user is admin or user and redirect accordingly
      if (userData.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("User not found.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }

  };

  return (
    <Background>
      <Container>
        <LoginCard elevation={5}>
          <Logo src="/logo.jpg" alt="Logo" />
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            Welcome Back!
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
        </LoginCard>
      </Container>
    </Background>
  );
};

export default Login;
