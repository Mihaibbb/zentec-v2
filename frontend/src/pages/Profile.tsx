import React, { useEffect, useState } from "react";
import { api, getCurrentUser, logout } from "../lib/api";
import { useNavigate } from "react-router-dom";
import HourPicker from "../components/HourPicker";
import LoadingSpinner from "../components/LoadingSpinner";
import { LogOut } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [form, setForm] = useState({
    clinicName: "",
    startHour: "8",
    endHour: "22"
  });
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  useEffect(() => {
    async function load() {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        // Get user details
        const { data: userData } = await api.get("/auth/me");
        setUser(userData);

        // Get clinic details if user has a clinic
        if (userData.clinicId) {
          try {
            const { data: clinicData } = await api.get("/clinic/me");
            setClinic(clinicData);
            setForm({
              clinicName: clinicData.name || "",
              startHour: "8", // Default values, can be extended later
              endHour: "22"
            });
          } catch (err) {
            console.error("Failed to load clinic:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-4xl font-semibold text-center mb-4 lg:mb-8">Profile</h1>
      <form 
        className="rounded-xl p-4 lg:p-6 space-y-4"
        style={{ background: 'linear-gradient(90deg,  rgb(25, 28, 65), transparent)' }}
      >
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Name</label>
              <input 
                className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                value={`${user.firstName} ${user.lastName}`}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Email</label>
              <input 
                className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                value={user.email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Role</label>
              <input 
                className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                value={user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "Doctor"}
                readOnly
              />
            </div>
          </div>
        )}
        {clinic && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-slate-400">Clinic Name</label>
                <input 
                  className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  value={form.clinicName} 
                  onChange={e => setForm({ ...form, clinicName: e.target.value })} 
                  placeholder="Clinic name" 
                />
              </div>
              {clinic.email && (
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Clinic Email</label>
                  <input 
                    className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                    value={clinic.email}
                    readOnly
                  />
                </div>
              )}
            </div>
            {clinic.location && (
              <div>
                <label className="block text-sm mb-1 text-slate-400">Location</label>
                <input 
                  className="w-full rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors" 
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  value={clinic.location}
                  readOnly
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-slate-400">Program Start Hour</label>
                <HourPicker
                  value={form.startHour}
                  onChange={(value) => setForm({ ...form, startHour: value })}
                  min={0}
                  max={23}
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Program End Hour</label>
                <HourPicker
                  value={form.endHour}
                  onChange={(value) => setForm({ ...form, endHour: value })}
                  min={0}
                  max={23}
                  placeholder="22"
                />
              </div>
            </div>
            <div className="pt-2">
              <button type="button" className="btn">Save Changes</button>
            </div>
          </>
        )}
        {!clinic && user && (
          <div className="text-slate-400">You are not associated with any clinic.</div>
        )}
        <div className="pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}

