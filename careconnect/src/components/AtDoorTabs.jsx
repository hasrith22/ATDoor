import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function AtDoorTabs({ tabs, active, onChange }) {
  return <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-muted p-1">
    {tabs.map((tab) => <Button key={tab.id} variant="ghost" onClick={() => onChange(tab.id)} className={`relative h-10 shrink-0 overflow-hidden px-4 ${active === tab.id ? "text-primary-foreground" : "text-muted-foreground"}`}>
      {active === tab.id && <motion.span layoutId="atdoor-tab" className="absolute inset-0 rounded-md bg-primary" transition={{ type: "spring", stiffness: 300, damping: 28 }} />}
      <span className="relative z-10 flex items-center gap-2">{tab.icon}{tab.label}</span>
    </Button>)}
  </div>;
}
