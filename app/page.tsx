"use client";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/login";
    } else if (role === "admin") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/user/dashboard";
    }
  }, []);

  return <p>Redirecting...</p>;
}
