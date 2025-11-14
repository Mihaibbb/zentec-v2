import React, { useEffect, useState, useRef } from "react";
import { api, getCurrentUser } from "../lib/api";
import { Link } from "react-router-dom";
import { Search, Pencil, Trash2, Plus, Download, Upload } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import LoadingSpinner from "../components/LoadingSpinner";
import Papa from "papaparse";

export default function Doctors() {
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; doctorId: number | null; doctorName: string }>({
    isOpen: false,
    doctorId: null,
    doctorName: ""
  });

  async function load() {
    if (!clinicId) return;
    setLoading(true);
    try {
      const { data } = await api.get("/doctors", { params: { clinicId } });
      setDoctors(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [clinicId]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExportCSV() {
    const filtered = doctors.filter((d: any) => d.name.toLowerCase().includes(q.toLowerCase()));
    const csvData = filtered.map((d: any, index: number) => ({
      "No.": index + 1,
      "Name": d.name,
      "Color": d.color || ""
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `doctors_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleImportCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!clinicId) {
      alert("No clinic associated with your account.");
      return;
    }
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          for (const row of results.data as any[]) {
            if (row.Name && row["Email"] && row["Password"]) {
              const userResponse = await api.post(`/clinic/${clinicId}/users`, {
                firstName: row.Name.split(" ")[0] || row.Name,
                lastName: row.Name.split(" ").slice(1).join(" ") || "",
                email: row["Email"],
                password: row["Password"],
                role: "doctor"
              });
              
              // Update doctor color if provided
              if (row["Color"]) {
                // Find the doctor ID by userId
                const { data: allDoctors } = await api.get("/doctors", { params: { clinicId } });
                const doctor = allDoctors.find((d: any) => d.userId === userResponse.data.id);
                if (doctor) {
                  await api.patch(`/doctors/${doctor.id}`, { color: row["Color"] });
                }
              }
            }
          }
          await load();
          alert("Doctors imported successfully!");
        } catch (error: any) {
          alert("Error importing doctors. Please check the CSV format. " + (error.response?.data?.error || error.message));
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      error: (error) => {
        alert("Error parsing CSV file: " + error.message);
      }
    });
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-4xl font-semibold text-center mb-4 lg:mb-8">Doctors</h1>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="relative flex-1 sm:w-72">
          <input className="input pr-9 w-full" placeholder="Search doctor..." value={q} onChange={e => setQ(e.target.value)} />
          <Search size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 lg:px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm lg:text-base"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
          <label className="px-3 lg:px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer text-sm lg:text-base">
            <Upload size={18} />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl p-4 lg:p-6" style={{ background: 'linear-gradient(135deg, rgb(47,50,109), rgb(25,28,65))' }}>
        {doctors.filter((d: any) => d.name.toLowerCase().includes(q.toLowerCase())).length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xl lg:text-3xl font-semibold">
            No doctors
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-2">No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Color</th>
                    <th className="text-center">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.filter((d: any) => d.name.toLowerCase().includes(q.toLowerCase())).map((d, i) => (
                    <tr key={d.id} className="border-t border-slate-700">
                      <td className="py-2">{i + 1}</td>
                      <td>{d.name}</td>
                      <td>{d.email || "-"}</td>
                      <td><span className="inline-block w-4 h-4 rounded-full" style={{ background: d.color }} /></td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            to={`/doctors/${d.id}/edit`}
                            className="relative px-2 py-1 hover:text-slate-200 transition-colors group" 
                          >
                            <Pencil size={16} />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                              Edit
                            </span>
                          </Link>
                          <button 
                            className="relative px-2 py-1 hover:text-red-300 transition-colors group" 
                            onClick={() => setConfirmDelete({ isOpen: true, doctorId: d.id, doctorName: d.name })}
                          >
                            <Trash2 size={16} />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {doctors.filter((d: any) => d.name.toLowerCase().includes(q.toLowerCase())).map((d, i) => (
                <div key={d.id} className="bg-slate-800/50 rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-slate-400 text-sm mb-1">No.</div>
                      <div className="text-slate-200 font-semibold text-lg">{i + 1}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/doctors/${d.id}/edit`}
                        className="px-3 py-2 hover:text-slate-200 transition-colors" 
                      >
                        <Pencil size={18} />
                      </Link>
                      <button 
                        className="px-3 py-2 hover:text-red-300 transition-colors" 
                        onClick={() => setConfirmDelete({ isOpen: true, doctorId: d.id, doctorName: d.name })}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Name</div>
                    <div className="text-slate-200 text-base">{d.name}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Email</div>
                    <div className="text-slate-200 text-base">{d.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Color</div>
                    <span className="inline-block w-8 h-8 rounded-full" style={{ background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Link
        to="/doctors/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
      >
        <Plus size={24} className="text-white" />
      </Link>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, doctorId: null, doctorName: "" })}
        onConfirm={async () => {
          if (confirmDelete.doctorId) {
            await api.delete(`/doctors/${confirmDelete.doctorId}`);
            await load();
          }
        }}
        title="Delete Doctor"
        message={`Are you sure you want to delete the doctor "${confirmDelete.doctorName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

    </div>
  );
}

