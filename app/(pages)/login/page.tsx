"use client";
import { useState } from "react";
import { Container, Card, CardContent, Typography, TextField, Button, Alert, Box } from "@mui/material";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      document.cookie = `token=${data.token}; path=/; secure`;
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);
      window.location.href = data.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card sx={{ width: "100%", boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Image src="/favicon.ico" alt="Logo" width={40} height={40} />
            <Typography variant="h5" sx={{ ml: 2, fontWeight: 700, color: "primary.main" }}>
              Vending Machine Manager
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ color: "secondary.main", mb: 2 }}>
            Please login to continue
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              color="primary"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              color="secondary"
            />
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              type="submit"
              sx={{ mt: 3, fontWeight: 600, fontSize: "1rem" }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
