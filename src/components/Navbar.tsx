import { Link } from "react-router-dom";
import { Anchor } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-700 text-white">
            <Anchor size={24} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">SkipperOS</p>
            <p className="text-xs text-slate-500">Small boat operations</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <a href="/#features" className="text-sm font-semibold text-slate-600">
            Features
          </a>
          <a href="/#pricing" className="text-sm font-semibold text-slate-600">
            Pricing
          </a>
          <Link to="/login" className="text-sm font-semibold text-slate-600">
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-ocean-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-900"
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}