import { createFileRoute } from "@tanstack/react-router";
import Services from "@/pages/Services";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Home Services — AtDoor" },
    { name: "description", content: "Explore repair, cleaning, maintenance, and appliance services available through AtDoor." },
    { property: "og:title", content: "Home Services — AtDoor" },
    { property: "og:description", content: "Explore repair, cleaning, maintenance, and appliance services available through AtDoor." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Services,
});