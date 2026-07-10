import {
  Anchor,
  Brain,
  ClipboardCheck,
  FileText,
  Fuel,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ClipboardCheck,
    title: "Digital trip logs",
    text: "Record departures, returns, crew, fuel, notes, photos, and operational records.",
  },
  {
    icon: Wrench,
    title: "Maintenance tracking",
    text: "Track engine hours, service reminders, repairs, and maintenance history.",
  },
  {
    icon: FileText,
    title: "Document expiry alerts",
    text: "Stay ahead of licenses, inspections, insurance, permits, and certificates.",
  },
  {
    icon: Users,
    title: "Crew management",
    text: "Manage crew details, roles, availability, and certificate expiry dates.",
  },
  {
    icon: Fuel,
    title: "Fuel tracking",
    text: "Track fuel levels before and after trips to control costs and spot issues.",
  },
  {
    icon: Brain,
    title: "AI log assistant",
    text: "Turn rough captain notes into clean professional logs and reports.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="bg-gradient-to-br from-ocean-900 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-ocean-100">
              <Anchor size={16} />
              Built for 1–50 vessel operators
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              The operating system for small boat businesses.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              SkipperOS helps fishing fleets, charter boats, dive operators, tour boats,
              harbour transport, and workboats manage trips, crew, maintenance,
              documents, fuel, incidents, and compliance records.

            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-xl bg-white px-6 py-3 text-center font-bold text-ocean-900 shadow-lg"
              >
                Start free
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-white/20 px-6 py-3 text-center font-bold text-white hover:bg-white/10"
              >
                View demo
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Replace paper logs, WhatsApp chaos, Excel sheets, and forgotten maintenance.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-2xl bg-slate-950/80 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today’s operations</p>
                  <h2 className="text-2xl font-bold">Fleet overview</h2>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300">
                  Live
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewCard title="Active trips" value="3" />
                <PreviewCard title="Maintenance due" value="2" />
                <PreviewCard title="Expiring documents" value="5" />
                <PreviewCard title="Crew scheduled" value="18" />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-ocean-100">
                  <ShieldAlert size={18} />
                  <p className="text-sm font-bold">AI-generated log</p>
                </div>
                <p className="text-sm leading-6 text-slate-200">
                  Vessel returned at 14:10 with 4 crew onboard. Fuel remaining 52%.
                  Minor pump leak reported. Maintenance task created automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="font-bold text-ocean-700">Features</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Built around real small-boat admin.
          </h2>
          <p className="mt-4 text-slate-600">
            Simple tools for operators who need clean records without enterprise complexity.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="font-bold text-ocean-700">Pricing</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Simple pricing for real operators.
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <PriceCard name="Starter" price="$29" text="For 1 boat." />
            <PriceCard name="Fleet" price="$79" text="For 2–5 boats." highlighted />
            <PriceCard name="Operator Pro" price="$149" text="For 6–20 boats." />
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

<a
  href="https://buysellstartups.com/listings/skipperos-mrdi8daj"
  target="_blank"
  rel="noopener"
>
  <img
    src="https://buysellstartups.com/api/badge/skipperos-mrdi8daj"
    alt="For Sale on Buy Sell Startups"
    width={280}
    height={68}
  />
</a>

function PriceCard({
  name,
  price,
  text,
  highlighted = false,
}: {
  name: string;
  price: string;
  text: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-7 shadow-sm ${highlighted
        ? "border-ocean-700 bg-ocean-900 text-white"
        : "border-slate-200 bg-white"
        }`}
    >
      <h3 className="text-xl font-black">{name}</h3>
      <p className={`mt-2 text-sm ${highlighted ? "text-ocean-100" : "text-slate-600"}`}>
        {text}
      </p>
      <div className="mt-6">
        <span className="text-4xl font-black">{price}</span>
        <span className={highlighted ? "text-ocean-100" : "text-slate-500"}>/month</span>
      </div>
      <Link
        to="/signup"
        className={`mt-7 block w-full rounded-xl px-5 py-3 text-center font-bold ${highlighted ? "bg-white text-ocean-900" : "bg-ocean-700 text-white"
          }`}
      >
        Choose plan
      </Link>
    </div>
  );
}