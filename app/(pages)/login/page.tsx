"use client";
import { useState } from "react";
import Image from "next/image";
import { Alert } from "@mui/material"; // keep for nice alerts

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120] p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 space-y-2">
        {/* Logo + Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Image src="/assets/logos/logo.jpeg" alt="Logo" width={132} height={10} />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Vending Machine Manager
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.9rem" }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} Invictus Zone. All rights reserved.
        </p>
      </div>
    </div>
  );
}
