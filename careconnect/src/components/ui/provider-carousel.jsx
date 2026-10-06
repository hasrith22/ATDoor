import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Clock3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProviderCarousel({ providers = [], onDetails, onBook, onSelect }) {
  const [activeId, setActiveId] = useState(null);
  const activeProvider = providers.find((item) => item.id === activeId);
  const remainingProviders = providers.filter((item) => item.id !== activeId);

  const handleDetails = (item) => {
    if (typeof onDetails === "function") {
      onDetails(item);
    } else if (typeof onSelect === "function") {
      onSelect(item);
    }
  };

  const handleBook = (item) => {
    if (typeof onBook === "function") {
      onBook(item);
    } else if (typeof onDetails === "function") {
      onDetails(item);
    } else if (typeof onSelect === "function") {
      onSelect(item);
    }
  };

  if (!providers.length) {
    return <div className="rounded-lg border border-border bg-muted p-8 text-center text-muted-foreground">No providers match your search.</div>;
  }

  return (
    <motion.div layout className="space-y-4">
      <AnimatePresence mode="popLayout">
        {activeProvider && (
          <motion.article
            key={activeProvider.id}
            layoutId={`provider-${activeProvider.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.6 }}
            className="grid min-h-80 overflow-hidden rounded-lg border border-border bg-card shadow-panel md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
          >
            <div className="min-h-72 overflow-hidden bg-muted md:min-h-full">
              <img src={activeProvider.image} alt={`Demo portrait for ${activeProvider.name}`} className="h-full w-full object-cover object-top grayscale" width="800" height="912" />
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div><h3 className="text-2xl font-black">{activeProvider.name}</h3><p className="mt-1 text-muted-foreground">{activeProvider.service}</p></div>
                  <BadgeCheck className="size-6 shrink-0" aria-label="Verified provider" />
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm"><span className="flex items-center gap-1 font-bold"><Star className="size-4 fill-current" />{activeProvider.rating}</span><span className="text-muted-foreground">({activeProvider.reviews.toLocaleString()} reviews)</span></div>
                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm"><div><p className="text-xs text-muted-foreground">Availability</p><p className="mt-1 font-bold">{activeProvider.availability}</p></div><div><p className="text-xs text-muted-foreground">Starting at</p><p className="mt-1 text-xl font-black">₹{activeProvider.price}</p></div></div>
                <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />{activeProvider.response}</p>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => handleDetails(activeProvider)}>View Details</Button><Button onClick={() => handleBook(activeProvider)}>Book Service</Button></div>
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      <motion.div layout className={`grid gap-4 ${activeProvider ? "sm:grid-cols-2" : "md:grid-cols-3"}`}>
        {(activeProvider ? remainingProviders : providers).map((item, index) => (
          <motion.button
            type="button"
            key={item.id}
            layoutId={`provider-${item.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.6, delay: activeProvider ? 0 : index * 0.06 }}
            onClick={() => setActiveId(item.id)}
            className={`group overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-foreground/30 ${activeProvider ? "grid min-h-36 grid-cols-[7rem_1fr]" : "block"}`}
            aria-label={`Expand ${item.name}`}
          >
            <div className={`${activeProvider ? "h-full" : "aspect-[5/3]"} overflow-hidden bg-muted`}><img src={item.image} alt={`Demo portrait for ${item.name}`} className="h-full w-full object-cover object-top grayscale transition-transform duration-500 group-hover:scale-105" loading="lazy" width="800" height="912" /></div>
            <div className={activeProvider ? "flex min-w-0 flex-col justify-center p-4" : "p-5"}>
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-lg font-black">{item.name}</h3><p className="truncate text-sm text-muted-foreground">{item.service}</p></div><BadgeCheck className="size-5 shrink-0" /></div>
              <div className="mt-3 flex items-center gap-2 text-sm"><span className="flex items-center gap-1 font-bold"><Star className="size-4 fill-current" />{item.rating}</span><span className="truncate text-muted-foreground">₹{item.price} onwards</span></div>
              {!activeProvider && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-4" />{item.availability}</p>}
            </div>
          </motion.button>
        ))}
      </motion.div>
      {activeProvider && <div className="flex justify-center"><Button variant="ghost" onClick={() => setActiveId(null)}>Show all providers</Button></div>}
    </motion.div>
  );
}