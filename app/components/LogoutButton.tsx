"use client";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Remove the token cookie by calling your logout API
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleLogout}
      sx={{ fontWeight: 600 }}
    >
      Logout
    </Button>
  );
}