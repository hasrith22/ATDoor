import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Hand, ImagePlus, MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIDiagnosis } from "@/components/AIDiagnosis";
import { ProviderFlow } from "@/components/ProviderFlow";
import { ServiceBanners } from "@/components/ServiceBanners";
import { ServiceCategories } from "@/components/ServiceCategories";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [showProviders, setShowProviders] = useState(true);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [issue, setIssue] = useState("");
  const servicesRef = useRef(null);
  const aiRef = useRef(null);
  const issueRef = useRef(null);

  const greetingName = user?.name ? user.name.split(" ")[0] : "there";
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const pick = (category) => {
    setSelected(category);
    setShowProviders(true);
    setTimeout(() => servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-bold text-muted-foreground">{todayStr}</p>
          <h1 className="mt-3 flex items-center gap-3 text-4xl font-black leading-tight sm:text-5xl">
            Good day, {greetingName} <Hand className="size-9 sm:size-11" aria-label="waving hand" />
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">What home service do you need help with today?</p>
        </motion.div>
        <div className="mt-10">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground sm:p-9 shadow-md">
            <p className="eyebrow text-primary-foreground/70">AI SERVICE ASSISTANT</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Tell us what’s wrong</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              Describe your problem and AtDoor AI will identify the right technician and diagnose the issue.
            </p>
            <Textarea
              ref={issueRef}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Example: My AC is making a loud rattling noise and isn't cooling properly."
              className="mt-7 min-h-28 border-primary-foreground/20 bg-background text-foreground placeholder:text-muted-foreground rounded-xl"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => issueRef.current?.focus()}>
                <MessageSquareText />
                Describe Problem
              </Button>
              <Button variant="secondary" onClick={() => aiRef.current?.scrollIntoView({ behavior: "smooth" })}>
                <ImagePlus />
                Upload Photo
              </Button>
              <Button variant="secondary" onClick={() => aiRef.current?.scrollIntoView({ behavior: "smooth" })}>
                <Sparkles />
                AI Analyze
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ServiceBanners
          onAction={(i) =>
            i === 1
              ? aiRef.current?.scrollIntoView({ behavior: "smooth" })
              : document.getElementById(i === 2 ? "providers" : "services")?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </section>
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <p className="eyebrow">VERIFIED SPECIALISTS</p>
        <h2 className="section-title">Explore Services</h2>
        <p className="section-copy">Choose a category or let AtDoor AI match the right professional for you.</p>
        <div className="mt-8">
          <ServiceCategories selected={selected} onSelect={pick} />
        </div>
        {selected && (
          <motion.div
            ref={servicesRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl bg-muted p-5 sm:p-7 border border-border"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{selected.name}</p>
                <h3 className="mt-1 text-2xl font-black">What do you need help with?</h3>
              </div>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Clear selection
              </Button>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {selected.options?.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  className="h-auto justify-between py-4 text-left font-semibold"
                  onClick={() => {
                    setShowProviders(true);
                    setTimeout(() => document.getElementById("providers")?.scrollIntoView({ behavior: "smooth" }), 50);
                  }}
                >
                  {option}
                  <ArrowRight className="size-4 shrink-0" />
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </section>
      <div ref={aiRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AIDiagnosis
          onComplete={(result) => {
            setAiDiagnosis(result);
            setShowProviders(true);
            setTimeout(() => document.getElementById("providers")?.scrollIntoView({ behavior: "smooth" }), 50);
          }}
        />
        <ProviderFlow aiDiagnosis={aiDiagnosis} onClearAi={() => setAiDiagnosis(null)} visible={showProviders} />
      </div>
    </main>
  );
}
