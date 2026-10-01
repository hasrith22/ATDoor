import { createFileRoute } from "@tanstack/react-router";
import Help from "@/pages/Help";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [
    { title: "Help Centre — AtDoor" },
    { name: "description", content: "Get help with AtDoor bookings, payments, providers, refunds, and AI diagnosis." },
    { property: "og:title", content: "Help Centre — AtDoor" },
    { property: "og:description", content: "Get help with AtDoor bookings, payments, providers, refunds, and AI diagnosis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Help,
});