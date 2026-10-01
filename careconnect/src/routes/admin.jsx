import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/pages/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — AtDoor" },
      { name: "description", content: "Platform Administration and Monitoring for AtDoor." },
    ],
  }),
  component: AdminDashboard,
});
