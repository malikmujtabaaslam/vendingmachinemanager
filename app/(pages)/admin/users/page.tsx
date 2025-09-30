"use client";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import UsersTable from "../../components/UsersTable";

export default function AdminUsersPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password !== rePassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ User created successfully!");
        setEmail("");
        setPassword("");
        setRePassword("");
      } else {
        setMessage(data.error || "❌ Failed to create user");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating user");
    }
  }

  return (
    <Box sx={{ mx: 4, mt: 2 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: "primary.main",
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif", // or use Google Font
          textTransform: "uppercase",
        }}
      >
        Manage Users
      </Typography>
      {/* Flex container for table (left) and form (right) */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Users Table (70%) */}
        <Card sx={{ flex: 7, borderRadius: 3, boxShadow: 4 }}>
          <CardHeader title="Users" titleTypographyProps={{ variant: "h5" }} />
          <CardContent>
            <UsersTable editable={true} />
          </CardContent>
        </Card>

        {/* Create User Form (30%) */}
        <Card sx={{ flex: 3, borderRadius: 3, boxShadow: 4 }}>
          <CardHeader title="Create User" titleTypographyProps={{ variant: "h5" }} />
          <CardContent>
            {message && (
              <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <form onSubmit={handleCreateUser} autoComplete="off">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="new-email"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <CardActions sx={{ justifyContent: "center", mt: 1 }}>
                <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 2, px: 4 }}>
                  Create User
                </Button>
              </CardActions>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
