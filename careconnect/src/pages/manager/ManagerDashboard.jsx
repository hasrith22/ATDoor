import { AlertTriangle, ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overviewStats, qualityMetrics } from "@/data/analytics";
import { StatCard } from "@/components/manager/StatCard";
import { AttentionCard } from "@/components/manager/AttentionCard";
import { BookingTable } from "@/components/manager/BookingTable";
import { useManager } from "@/components/manager/ManagerContext";
import { Link } from "react-router-dom";

export default function ManagerDashboard() {
  const { bookings } = useManager();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <p className="text-sm font-bold text-muted-foreground">Thursday, September 24</p>
        <h2 className="mt-1 text-2xl font-black">Here’s what’s happening across AtDoor today.</h2>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {overviewStats.map((item, i) => (
          <StatCard key={item.label} item={item} index={i} />
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-black">Live Operations</h2>
            <p className="text-xs text-muted-foreground">Current bookings across service zones.</p>
          </div>
          <Link to="/manager/operations" className="flex items-center gap-1 text-sm font-bold">
            View board <ArrowRight className="size-4" />
          </Link>
        </div>
        <BookingTable rows={bookings.slice(0, 6)} compact />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Needs Attention</h2>
              <p className="text-xs text-muted-foreground">Operational issues requiring action.</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <div className="mt-5 grid gap-3 2xl:grid-cols-3">
            <AttentionCard
              type="Provider cancelled"
              priority="High"
              title="AC Repair"
              booking="ATD-1030"
              details="Rahul Sharma · 10:00 AM"
              primary="Reassign Provider"
            />
            <AttentionCard
              type="Job delayed"
              priority="Medium"
              title="Plumbing Repair"
              booking="ATD-1025"
              details="Suresh Reddy · 35 min delay"
              primary="Contact Provider"
            />
            <AttentionCard
              type="Unassigned request"
              priority="Urgent"
              title="Electrical Repair"
              booking="ATD-1026"
              details="Madhapur · Requested ASAP"
              primary="Assign Provider"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Today’s Schedule</h2>
              <p className="text-xs text-muted-foreground">Next field visits.</p>
            </div>
            <Clock3 className="size-4" />
          </div>
          <div className="mt-5 space-y-4">
            {bookings.slice(0, 4).map((b) => (
              <div className="flex gap-4" key={b.id}>
                <span className="w-16 text-xs font-bold">{b.scheduled}</span>
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-bold">{b.service}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.provider} · {b.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Summary title="Service Quality" items={qualityMetrics.slice(0, 4)} />
        <Summary
          title="Provider Performance"
          items={[
            { label: "Providers online", value: "130" },
            { label: "Avg. on-time rate", value: "94%" },
            { label: "Jobs per provider", value: "3.8" },
            { label: "Acceptance rate", value: "91%" },
          ]}
        />
      </section>
    </div>
  );
}

function Summary({ title, items }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-black">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((x) => (
          <div className="rounded-md bg-muted p-3" key={x.label}>
            <p className="text-xl font-black">{x.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{x.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
