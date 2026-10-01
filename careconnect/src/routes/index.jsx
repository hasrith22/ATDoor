import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — AtDoor" },
    { name: "description", content: "Find trusted home services, diagnose an issue, and book a professional with AtDoor." },
    { property: "og:title", content: "Dashboard — AtDoor" },
    { property: "og:description", content: "Find trusted home services, diagnose an issue, and book a professional with AtDoor." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});