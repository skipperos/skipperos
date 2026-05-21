import { useEffect, useState } from "react";
import { Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";
import { createDocument } from "../services/documentService";

export default function AddDocument() {
  const navigate = useNavigate();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [boatId, setBoatId] = useState("");

  const [documentType, setDocumentType] = useState("Vessel registration");
  const [documentName, setDocumentName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoats() {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      const data = await getBoatsForUser(user.uid);
      setBoats(data);

      if (data.length > 0) {
        setBoatId(data[0].id);
      }

      setLoadingBoats(false);
    }

    loadBoats();
  }, [navigate]);

  async function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    const selectedBoat = boats.find((boat) => boat.id === boatId);

    if (!selectedBoat) {
      setError("Please select a boat before saving the document.");
      return;
    }

    setLoading(true);

    try {
      await createDocument(user.uid, {
        boatId,
        boatName: selectedBoat.boatName,
        documentType,
        documentName,
        documentNumber,
        issueDate,
        expiryDate,
        notes,
      });

      navigate("/documents");
    } catch (err: any) {
      setError(err.message || "Could not save document.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-700 text-white">
              <Anchor size={24} />
            </div>

            <div>
              <p className="text-xl font-black text-slate-900">Add document</p>
              <p className="text-xs text-slate-500">
                Track certificates, permits, insurance, and licenses
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/documents")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">
            Document details
          </h1>

          <p className="mt-2 text-slate-600">
            Add important vessel, crew, compliance, insurance, or permit records.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loadingBoats ? (
            <p className="mt-8 font-semibold text-slate-600">Loading boats...</p>
          ) : boats.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <h2 className="font-black text-slate-900">No boats available</h2>
              <p className="mt-2 text-sm text-slate-600">
                Add a boat before creating document records.
              </p>
              <button
                onClick={() => navigate("/boats/add")}
                className="mt-5 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white"
              >
                Add boat
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateDocument} className="mt-8 grid gap-5">
              <div>
                <label className="text-sm font-bold text-slate-700">Boat</label>
                <select
                  value={boatId}
                  onChange={(e) => setBoatId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  {boats.map((boat) => (
                    <option key={boat.id} value={boat.id}>
                      {boat.boatName} — {boat.vesselType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Document type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  <option>Vessel registration</option>
                  <option>Safety certificate</option>
                  <option>Insurance</option>
                  <option>Fishing permit</option>
                  <option>Charter permit</option>
                  <option>Skipper license</option>
                  <option>Radio license</option>
                  <option>Inspection certificate</option>
                  <option>Crew certificate</option>
                  <option>Medical certificate</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Document name
                </label>
                <input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  placeholder="Annual safety inspection certificate"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Document number
                </label>
                <input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  placeholder="Certificate / permit / license number"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Issue date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
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
                  placeholder="Any inspection notes, restrictions, renewal reminders, or compliance details..."
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving document..." : "Save document"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}