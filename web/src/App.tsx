import { useEffect, useState } from "react"
import { Routes, Route, Navigate } from "react-router"
import { LoginForm } from "@/components/LoginForm"
import { Dashboard } from "@/components/Dashboard"
import { DashboardAdmin } from "@/components/Dashboard_admin"
import { RegisterForm } from "./components/RegisterForm"
import { Posts } from "@/components/Posts"

type Role = "user" | "admin" | null | "loading"

function DashboardRoute() {
  const [role, setRole] = useState<Role>("loading")

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRole(data?.role ?? null))
      .catch(() => setRole(null))
  }, [])

  if (role === "loading") return null
  if (role === null) return <Navigate to="/login" />
  if (role === "admin") return <DashboardAdmin />
  return <Dashboard />
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
