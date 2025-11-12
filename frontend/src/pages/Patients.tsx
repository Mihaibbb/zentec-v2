import React, { useEffect, useState, useRef } from "react";
import { api, getCurrentUser } from "../lib/api";
import { Link } from "react-router-dom";
import { Search, Pencil, Trash2, Plus, Download, Upload, ChevronDown, ChevronUp } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import Papa from "papaparse";

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const user = getCurrentUser();
  const clinicId = user?.clinicId;
  const [q, setQ] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; patientId: number | null; patientName: string }>({
    isOpen: false,
    patientId: null,
    patientName: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleRow(patientId: number) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedRows(newExpanded);
  }

  useEffect(() => {
    if (!clinicId) return;
    api.get("/patients", { params: { clinicId } }).then(r => setPatients(r.data));
  }, [clinicId]);

  function handleExportCSV() {
    const filtered = patients.filter((p: any) => {
      const t = `${p.firstName} ${p.lastName} ${p.phone || ""}`.toLowerCase();
      return t.includes(q.toLowerCase());
    });
    const csvData = filtered.map((p: any) => ({
      "File No.": p.id,
      "First Name": p.firstName,
      "Last Name": p.lastName,
      "Phone": p.phone || "",
      "Email": p.email || "",
      "Date of Birth": p.dob || "",
      "Country": p.country || "",
      "City": p.city || "",
      "Address": p.address || "",
      "Gender": p.gender || "",
      "PIC": p.pic || "",
      "Notes": p.notes || ""
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `patients_${new Date().toISOString().split("T")[0]}.csv`);
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
            if (row["First Name"] && row["Last Name"] && row["Phone"]) {
              await api.post("/patients", {
                clinicId,
                firstName: row["First Name"],
                lastName: row["Last Name"],
                phone: row["Phone"],
                email: row["Email"] || "",
                dob: row["Date of Birth"] || "",
                fileNumber: row["File No."] || "",
                country: row["Country"] || "",
                city: row["City"] || "",
                address: row["Address"] || "",
                gender: row["Gender"] || "N",
                pic: row["PIC"] || "",
                notes: row["Notes"] || ""
              });
            }
          }
          const { data } = await api.get("/patients", { params: { clinicId } });
          setPatients(data);
          alert("Patients imported successfully!");
        } catch (error) {
          alert("Error importing patients. Please check the CSV format.");
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl lg:text-4xl font-semibold text-center mb-4 lg:mb-8">Patients</h1>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="relative flex-1 sm:w-72">
          <input className="input pr-9 w-full" placeholder="Search patient..." value={q} onChange={e => setQ(e.target.value)} />
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
        {patients.filter((p: any) => {
          const t = `${p.firstName} ${p.lastName} ${p.phone || ""}`.toLowerCase();
          return t.includes(q.toLowerCase());
        }).length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xl lg:text-3xl font-semibold">
            No patients
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-2">File No.</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th className="text-center">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.filter((p: any) => {
                    const t = `${p.firstName} ${p.lastName} ${p.phone || ""}`.toLowerCase();
                    return t.includes(q.toLowerCase());
                  }).map((p, i) => {
                    const isExpanded = expandedRows.has(p.id);
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="border-t border-slate-700">
                          <td className="py-2">{p.id}</td>
                          <td>{p.firstName}</td>
                          <td>{p.lastName}</td>
                          <td>{p.phone || "-"}</td>
                          <td>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => toggleRow(p.id)}
                                className="relative px-2 py-1 hover:text-slate-200 transition-colors group"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                                  {isExpanded ? "Collapse" : "Expand"}
                                </span>
                              </button>
                              <Link 
                                to={`/patients/${p.id}/edit`}
                                className="relative px-2 py-1 hover:text-slate-200 transition-colors group" 
                              >
                                <Pencil size={16} />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                                  Edit
                                </span>
                              </Link>
                              <button 
                                className="relative px-2 py-1 hover:text-red-300 transition-colors group" 
                                onClick={() => setConfirmDelete({ isOpen: true, patientId: p.id, patientName: `${p.firstName} ${p.lastName}` })}
                              >
                                <Trash2 size={16} />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                                  Delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-t border-slate-700 bg-slate-800/50">
                            <td colSpan={5} className="py-4 px-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-400">Email:</span> <span className="text-slate-200 ml-2">{p.email || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Date of Birth:</span> <span className="text-slate-200 ml-2">{p.dob || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Country:</span> <span className="text-slate-200 ml-2">{p.country || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">City:</span> <span className="text-slate-200 ml-2">{p.city || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Address:</span> <span className="text-slate-200 ml-2">{p.address || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Gender:</span> <span className="text-slate-200 ml-2">{p.gender || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">PIC:</span> <span className="text-slate-200 ml-2">{p.pic || "-"}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400">Notes:</span> <span className="text-slate-200 ml-2">{p.notes || "-"}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {patients.filter((p: any) => {
                const t = `${p.firstName} ${p.lastName} ${p.phone || ""}`.toLowerCase();
                return t.includes(q.toLowerCase());
              }).map((p) => {
                const isExpanded = expandedRows.has(p.id);
                return (
                  <div key={p.id} className="bg-slate-800/50 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">File No.</div>
                        <div className="text-slate-200 font-semibold text-lg">{p.id}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRow(p.id)}
                          className="px-3 py-2 hover:text-slate-200 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <Link 
                          to={`/patients/${p.id}/edit`}
                          className="px-3 py-2 hover:text-slate-200 transition-colors" 
                        >
                          <Pencil size={18} />
                        </Link>
                        <button 
                          className="px-3 py-2 hover:text-red-300 transition-colors" 
                          onClick={() => setConfirmDelete({ isOpen: true, patientId: p.id, patientName: `${p.firstName} ${p.lastName}` })}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Name</div>
                      <div className="text-slate-200 text-base">{p.firstName} {p.lastName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Phone</div>
                      <div className="text-slate-200 text-base">{p.phone || "-"}</div>
                    </div>
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-700 space-y-3 text-base">
                        <div><span className="text-slate-400">Email:</span> <span className="text-slate-200 ml-2">{p.email || "-"}</span></div>
                        <div><span className="text-slate-400">Date of Birth:</span> <span className="text-slate-200 ml-2">{p.dob || "-"}</span></div>
                        <div><span className="text-slate-400">Country:</span> <span className="text-slate-200 ml-2">{p.country || "-"}</span></div>
                        <div><span className="text-slate-400">City:</span> <span className="text-slate-200 ml-2">{p.city || "-"}</span></div>
                        <div><span className="text-slate-400">Address:</span> <span className="text-slate-200 ml-2">{p.address || "-"}</span></div>
                        <div><span className="text-slate-400">Gender:</span> <span className="text-slate-200 ml-2">{p.gender || "-"}</span></div>
                        <div><span className="text-slate-400">PIC:</span> <span className="text-slate-200 ml-2">{p.pic || "-"}</span></div>
                        <div><span className="text-slate-400">Notes:</span> <span className="text-slate-200 ml-2">{p.notes || "-"}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Link
        to="/patients/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
      >
        <Plus size={24} className="text-white" />
      </Link>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, patientId: null, patientName: "" })}
        onConfirm={async () => {
          if (confirmDelete.patientId) {
            await api.delete(`/patients/${confirmDelete.patientId}`);
            const { data } = await api.get("/patients", { params: { clinicId } });
            setPatients(data);
          }
        }}
        title="Delete Patient"
        message={`Are you sure you want to delete the patient "${confirmDelete.patientName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

    </div>
  );
}

