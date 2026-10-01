import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AirVent, ArrowRight, CircuitBoard, Droplets, Sparkles, Wrench } from "lucide-react";
import { categories as fallbackCategories } from "@/data/mockData";
import { categoriesApi } from "@/api/categories";

const iconMap = {
  AirVent,
  Droplets,
  CircuitBoard,
  Wrench,
  Sparkles,
};

export function ServiceCategories({ selected, onSelect, detailed = false }) {
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    let mounted = true;
    categoriesApi
      .getAll()
      .then((res) => {
        if (mounted && res?.data && res.data.length > 0) {
          const mapped = res.data.map((cat, idx) => {
            const fallback = fallbackCategories[idx] || fallbackCategories[0];
            return {
              id: cat._id || cat.slug || fallback.id,
              name: cat.name,
              description: cat.description,
              price: `₹${cat.basePrice}`,
              options: cat.options && cat.options.length > 0 ? cat.options : fallback.options,
              icon: iconMap[cat.icon] || fallback.icon,
              image: cat.image || fallback.image,
            };
          });
          setCategories(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback categories:", err.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className={`grid gap-px overflow-hidden rounded-lg border border-border bg-border ${
        detailed ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      }`}
    >
      {categories.map((category) => {
        const Icon = category.icon || Wrench;
        return (
          <motion.button
            whileHover={{ y: -2 }}
            key={category.id}
            onClick={() => onSelect?.(category)}
            className={`group bg-card p-4 text-left transition-colors hover:bg-accent sm:p-5 ${
              selected?.id === category.id ? "ring-2 ring-inset ring-primary" : ""
            }`}
          >
            {detailed ? (
              <div className="mb-4 aspect-[16/8] overflow-hidden rounded-md bg-muted">
                <img
                  src={category.image}
                  alt=""
                  className="h-full w-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width="1200"
                  height="800"
                />
              </div>
            ) : (
              <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-muted text-primary">
                <Icon className="size-6" />
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold sm:text-base">{category.name}</h3>
                {detailed && (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                    <p className="mt-3 text-xs font-bold text-primary">Starts at {category.price}</p>
                  </>
                )}
              </div>
              {detailed && (
                <ArrowRight className="mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-1" />
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
