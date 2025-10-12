"use client";
import { useState } from "react";
import { Alert, Button, Card, CardContent, CardHeader } from "@mui/material";
import UsersTable from "../../components/UsersTable";
import InputGroup from "@/components/FormElements/InputGroup";
import { Typography } from "@mui/material";

export default function AdminUsersPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rePassword = formData.get("rePassword") as string;

    if (password !== rePassword) {
      setError("❌ Passwords do not match");
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
        (e.target as HTMLFormElement).reset(); // ✅ clear form fields
      } else {
        setError(data.error || "❌ Failed to create user");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Error creating user");
    }
  }

  return (
    <div className="space-y-6">
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#5750F1",
          mb: 2,
        }}
      >
        Users
      </Typography>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <Card className="lg:col-span-2 shadow-md rounded-xl border border-gray-200 bg-white dark:bg-gray-900">
          
          <CardContent>
            <UsersTable editable={true} />
          </CardContent>
        </Card>

        {/* Create User Form */}
        <Card className="shadow-md rounded-xl border border-gray-200 bg-white dark:bg-gray-900">
          <CardHeader
            title="Create User"
            titleTypographyProps={{
              variant: "h6",
              sx: { fontWeight: 600, color: "#111827" },
            }}
          />
          <CardContent>
            {/* Show Alerts */}
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
            {message && (
              <Alert severity="success" className="mb-4">
                {message}
              </Alert>
            )}

            <form onSubmit={handleCreateUser} autoComplete="off">
              <InputGroup
                label="Email"
                type="email"
                name="email"
                placeholder="Enter user email"
                className="mb-4.5"
                required
              />

              <InputGroup
                label="Password"
                type="password"
                name="password"
                placeholder="Enter password"
                className="mb-4.5"
                required
              />

              <InputGroup
                label="Confirm Password"
                type="password"
                name="rePassword"
                placeholder="Re-enter password"
                className="mb-4.5"
                required
              />

              <Button
                type="submit"
                variant="contained"
                className="mt-4 w-full rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 normal-case"
              >
                Create User
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
