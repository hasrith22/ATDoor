import { createFileRoute } from "@tanstack/react-router";
import MyBookings from "@/pages/MyBookings";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [
    { title: "My Bookings — AtDoor" },
    { name: "description", content: "Track active AtDoor visits and review upcoming and completed home services." },
    { property: "og:title", content: "My Bookings — AtDoor" },
    { property: "og:description", content: "Track active AtDoor visits and review upcoming and completed home services." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: MyBookings,
});