import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createCrewMember } from "../services/crewService";
import { getCurrentUserSafe } from "../services/authUser";

export default function AddCrew() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Deckhand");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseName, setLicenseName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateCrewMember(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = await getCurrentUserSafe();

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await createCrewMember(user.uid, {
        fullName,
        role,
        phone,
        email,
        licenseName,
        licenseNumber,
        licenseExpiry,
        availability,
        emergencyContactName,
        emergencyContactPhone,
        notes,
      });

      navigate("/crew");
    } catch (err: any) {
      setError(err.message || "Could not save crew member.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-bold text-ocean-700">Crew</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">
          Add crew member
        </h1>
        <p className="mt-2 text-slate-600">
          Save crew details, roles, licenses, availability, and emergency contacts.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
            <UserPlus size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">Crew details</h2>
            <p className="text-sm text-slate-600">
              Add the person’s operating role and certificate information.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateCrewMember} className="mt-8 grid gap-5">
          <div>
            <label className="text-sm font-bold text-slate-700">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              placeholder="John Smith"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              >
                <option>Skipper</option>
                <option>Captain</option>
                <option>Deckhand</option>
                <option>Engineer</option>
                <option>Dive master</option>
                <option>Tour guide</option>
                <option>Mechanic</option>
                <option>Cook</option>
                <option>Safety officer</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              >
                <option>Available</option>
                <option>Unavailable</option>
                <option>On leave</option>
                <option>Standby</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="+27 82 000 0000"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="crew@example.com"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="text-sm font-bold text-slate-700">
                License / certificate
              </label>
              <input
                value={licenseName}
                onChange={(e) => setLicenseName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Skipper license"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                License number
              </label>
              <input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="CERT-12345"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                License expiry
              </label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Emergency contact name
              </label>
              <input
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Emergency contact phone
              </label>
              <input
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="+27 83 000 0000"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              placeholder="Preferred trips, medical notes operator should know, training notes, availability notes..."
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving crew member..." : "Save crew member"}
          </button>
        </form>
      </div>
    </section>
  );
}