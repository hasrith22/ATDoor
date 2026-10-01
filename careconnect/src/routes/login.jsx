import { createFileRoute } from "@tanstack/react-router";
import Login from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — AtDoor" },
      { name: "description", content: "Sign in to AtDoor home services marketplace." },
    ],
  }),
  component: Login,
});
