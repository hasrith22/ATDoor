import { createFileRoute } from "@tanstack/react-router";
import SupportDashboard from "@/pages/SupportDashboard";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support Portal — AtDoor" },
      { name: "description", content: "Support agent complaints and cancellations workspace." },
    ],
  }),
  component: SupportDashboard,
});
