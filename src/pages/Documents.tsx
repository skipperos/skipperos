import { useEffect, useState } from "react";
import { FileWarning, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { getCurrentUserSafe } from "../services/authUser";

import {
  getDaysUntilExpiry,
  getDocumentsForUser,
  getDocumentStatus,
} from "../services/documentService";
import type { VesselDocument } from "../services/documentService";

export default function Documents() {
  const [documents, setDocuments] = useState<VesselDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      const user = await getCurrentUserSafe();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDocumentsForUser(user.uid);
        setDocuments(data);
      } catch (error) {
        console.error("Documents load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Documents</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Certificates, permits, insurance, and licenses
          </h1>
          <p className="mt-2 text-slate-600">
            Track important document records, expiry dates, permit numbers, and compliance notes.
          </p>
        </div>

        <Link
          to="/documents/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add document
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">Loading documents...</p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching vessel certificates, permits, insurance, and licenses.
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <FileWarning size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No documents added yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add vessel registrations, insurance, permits, safety certificates,
              skipper licenses, and inspection documents.
            </p>

            <Link
              to="/documents/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first document
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => {
              const status = getDocumentStatus(document.expiryDate);
              const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);

              return (
                <div
                  key={document.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                    <FileWarning size={25} />
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {document.documentName}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {document.documentType}
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    <Info label="Boat" value={document.boatName} />
                    <Info
                      label="Document no."
                      value={document.documentNumber || "Not added"}
                    />
                    <Info
                      label="Issue date"
                      value={formatDate(document.issueDate)}
                    />
                    <Info
                      label="Expiry date"
                      value={formatDate(document.expiryDate)}
                    />
                  </div>

                  {document.notes && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {document.notes}
                      </p>
                    </div>
                  )}

                  <div
                    className={`mt-6 rounded-xl px-4 py-3 text-sm font-bold ${getStatusClass(
                      status
                    )}`}
                  >
                    {getStatusText(status, daysUntilExpiry)}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      to="/documents/add"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Add another
                    </Link>

                    <Link
                      to="/dashboard"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Dashboard
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-800">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Not added";

  return new Date(value).toLocaleDateString();
}

function getStatusClass(status: string) {
  if (status === "expired") {
    return "bg-red-50 text-red-700";
  }

  if (status === "expiring_soon") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

function getStatusText(status: string, daysUntilExpiry: number | null) {
  if (status === "expired") {
    return "Expired";
  }

  if (status === "expiring_soon") {
    return `Expiring soon: ${daysUntilExpiry} days left`;
  }

  if (daysUntilExpiry === null) {
    return "No expiry date";
  }

  return `Valid: ${daysUntilExpiry} days left`;
}