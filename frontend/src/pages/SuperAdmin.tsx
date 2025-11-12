import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { getEmailError, getPasswordError, getRequiredError, emailRegex } from "../utils/validation";

export default function SuperAdmin() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [newClinic, setNewClinic] = useState({ name: "", email: "", location: "" });
  const [clinicErrors, setClinicErrors] = useState<Record<string, string | null>>({});
  const [creating, setCreating] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", role: "admin" as "admin" | "doctor" });
  const [userErrors, setUserErrors] = useState<Record<string, string | null>>({});
  const [creatingUser, setCreatingUser] = useState(false);

  function validateClinic(): boolean {
    const newErrors: Record<string, string | null> = {};
    newErrors.name = getRequiredError(newClinic.name, "Name");
    newErrors.email = getEmailError(newClinic.email, true);
    setClinicErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== null);
  }

  function validateUser(): boolean {
    const newErrors: Record<string, string | null> = {};
    newErrors.firstName = getRequiredError(newUser.firstName, "First Name");
    newErrors.lastName = getRequiredError(newUser.lastName, "Last Name");
    newErrors.email = getEmailError(newUser.email, true);
    newErrors.password = getPasswordError(newUser.password, true);
    setUserErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== null);
  }

  async function load() {
    const { data } = await api.get("/admin/clinics");
    setClinics(data);
    if (!selectedClinicId && data?.length) setSelectedClinicId(data[0].id);
  }
  useEffect(() => { load(); }, []);

  async function addClinic(e: React.FormEvent) {
    e.preventDefault();
    if (!validateClinic()) return;
    setCreating(true);
    try {
      await api.post("/admin/clinics", newClinic);
      setNewClinic({ name: "", email: "", location: "" });
      setClinicErrors({});
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClinicId) return;
    if (!validateUser()) return;
    setCreatingUser(true);
    try {
      await api.post(`/admin/clinics/${selectedClinicId}/users`, newUser);
      setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "admin" });
      setUserErrors({});
      // just reload clinics list to keep UI simple (or fetch users per clinic in future)
      await load();
    } finally {
      setCreatingUser(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl lg:text-2xl font-semibold text-center mb-4 lg:mb-8">Super Admin - Clinics</h1>
      <form 
        onSubmit={addClinic} 
        className="rounded-xl p-4 lg:p-6 space-y-4"
        style={{ background: 'linear-gradient(90deg,  rgb(25, 28, 65), transparent)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Name <span className="text-red-500">*</span></label>
            <input 
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${clinicErrors.name ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={newClinic.name} 
              onChange={e => {
                setNewClinic({ ...newClinic, name: e.target.value });
                if (clinicErrors.name) setClinicErrors({ ...clinicErrors, name: getRequiredError(e.target.value, "Name") });
              }}
              required
            />
            {clinicErrors.name && <p className="text-red-400 text-xs mt-1">{clinicErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Email <span className="text-red-500">*</span></label>
            <input 
              type="email"
              pattern={emailRegex.source}
              title="Please enter a valid email address (e.g., user@example.com)"
              className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${clinicErrors.email ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={newClinic.email} 
              onChange={e => {
                setNewClinic({ ...newClinic, email: e.target.value });
                if (clinicErrors.email) setClinicErrors({ ...clinicErrors, email: getEmailError(e.target.value, true) });
              }}
              required
            />
            {clinicErrors.email && <p className="text-red-400 text-xs mt-1">{clinicErrors.email}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-400">Location</label>
          <input 
            className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            value={newClinic.location} 
            onChange={e => setNewClinic({ ...newClinic, location: e.target.value })} 
          />
        </div>
        <div className="pt-2">
          <button disabled={creating} type="submit" className="btn w-full">{creating ? "Creating..." : "Add Clinic"}</button>
        </div>
      </form>

      <div 
        className="rounded-xl p-4 lg:p-6 space-y-4"
        style={{ background: 'linear-gradient(90deg,  rgb(25, 28, 65), transparent)' }}
      >
        <div className="text-lg font-semibold text-slate-200">Add User to Clinic</div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Clinic</label>
            <select 
              className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={selectedClinicId ?? ""} 
              onChange={e => setSelectedClinicId(Number(e.target.value))}
            >
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Name <span className="text-red-500">*</span></label>
              <input 
                className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${userErrors.firstName ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                value={newUser.firstName} 
                onChange={e => {
                  setNewUser({ ...newUser, firstName: e.target.value });
                  if (userErrors.firstName) setUserErrors({ ...userErrors, firstName: getRequiredError(e.target.value, "First Name") });
                }}
                required
              />
              {userErrors.firstName && <p className="text-red-400 text-xs mt-1">{userErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Last Name <span className="text-red-500">*</span></label>
              <input 
                className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${userErrors.lastName ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                value={newUser.lastName} 
                onChange={e => {
                  setNewUser({ ...newUser, lastName: e.target.value });
                  if (userErrors.lastName) setUserErrors({ ...userErrors, lastName: getRequiredError(e.target.value, "Last Name") });
                }}
                required
              />
              {userErrors.lastName && <p className="text-red-400 text-xs mt-1">{userErrors.lastName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Email <span className="text-red-500">*</span></label>
              <input 
                type="email"
                pattern={emailRegex.source}
                title="Please enter a valid email address (e.g., user@example.com)"
                className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${userErrors.email ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                value={newUser.email} 
                onChange={e => {
                  setNewUser({ ...newUser, email: e.target.value });
                  if (userErrors.email) setUserErrors({ ...userErrors, email: getEmailError(e.target.value, true) });
                }}
                required
              />
              {userErrors.email && <p className="text-red-400 text-xs mt-1">{userErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Password <span className="text-red-500">*</span></label>
              <input 
                className={`w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border transition-colors ${userErrors.password ? 'border-red-500' : 'border-none focus:border-none focus:outline-none'}`}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                type="password" 
                value={newUser.password} 
                onChange={e => {
                  setNewUser({ ...newUser, password: e.target.value });
                  if (userErrors.password) setUserErrors({ ...userErrors, password: getPasswordError(e.target.value, true) });
                }}
                required
              />
              {userErrors.password && <p className="text-red-400 text-xs mt-1">{userErrors.password}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-400">Role</label>
            <select 
              className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              value={newUser.role} 
              onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div className="pt-2">
            <button disabled={creatingUser || !selectedClinicId} onClick={addUser as any} type="button" className="btn w-full">
              {creatingUser ? "Creating..." : "Add User"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c.id} className="border-t border-slate-700">
                <td className="py-2">{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.location || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

