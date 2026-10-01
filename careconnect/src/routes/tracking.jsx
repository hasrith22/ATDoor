import { createFileRoute } from "@tanstack/react-router";
import LiveTracking from "@/pages/LiveTracking";

export const Route = createFileRoute("/tracking")({
  head: () => ({ meta: [
    { title: "Live Service Tracking — AtDoor" },
    { name: "description", content: "Follow the mock arrival status for your active AtDoor service booking." },
    { property: "og:title", content: "Live Service Tracking — AtDoor" },
    { property: "og:description", content: "Follow the mock arrival status for your active AtDoor service booking." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LiveTracking,
});