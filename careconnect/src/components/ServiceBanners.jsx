import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import plumbing from "@/assets/banners/plumbing.jpg";
import electrical from "@/assets/banners/electrical.jpg";
import ac from "@/assets/banners/ac-service.jpg";

const cards = [
  {
    label: "PLUMBING SERVICES",
    title: "Leaks, fittings and plumbing repairs",
    copy: "Book a trusted plumber for taps, pipes, drains and bathroom fittings.",
    cta: "Explore plumbing",
    image: plumbing,
  },
  {
    label: "ELECTRICAL SERVICES",
    title: "Safe electrical help at home",
    copy: "Get help with wiring, switches, fans, fixtures and power issues.",
    cta: "Explore electrical",
    image: electrical,
  },
  {
    label: "GENERAL REPAIRS",
    title: "Everyday home fixes, handled",
    copy: "Find skilled professionals for minor repairs, fittings and maintenance.",
    cta: "Explore repairs",
    image: ac,
  },
];

export function ServiceBanners({ onAction }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          key={card.label}
          className="group relative min-h-96 overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-sm"
        >
          <img
            src={card.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            width="1200"
            height="800"
          />
          <div className="absolute inset-0 bg-banner-overlay" />
          <div className="relative flex h-full min-h-96 flex-col justify-between p-6">
            <span className="text-xs font-black tracking-widest">{card.label}</span>
            <div>
              <h3 className="max-w-xs text-2xl font-black leading-tight sm:text-3xl">{card.title}</h3>
              <p className="mt-3 max-w-xs text-sm text-primary-foreground/80">{card.copy}</p>
              <button
                onClick={() => onAction(index)}
                className="mt-6 inline-flex items-center gap-2 border-b border-primary-foreground pb-1 text-sm font-bold hover:gap-3 transition-all"
              >
                {card.cta}
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
