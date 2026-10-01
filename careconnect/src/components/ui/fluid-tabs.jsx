import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function FluidTabs({ tabs, active, onChange, layoutId = "fluid-tabs-active-pill" }) {
  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-border bg-muted p-1 transition-colors">
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <Button
            key={tab.id}
            type="button"
            variant="ghost"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={`group relative h-10 overflow-hidden rounded-md px-3 outline-none lg:px-4 ${
              isActive ? "text-primary-foreground hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 280, damping: 25, mass: 0.8 }}
                className="absolute inset-0 rounded-md border border-primary bg-primary shadow-xs"
              />
            )}
            <motion.span
              animate={{ filter: isActive ? ["blur(0px)", "blur(3px)", "blur(0px)"] : "blur(0px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-10 flex items-center gap-2 whitespace-nowrap text-sm font-bold"
            >
              <motion.span
                animate={{ scale: isActive ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex shrink-0 items-center justify-center"
              >
                {tab.icon}
              </motion.span>
              <span>{tab.label}</span>
            </motion.span>
          </Button>
        );
      })}
    </div>
  );
}