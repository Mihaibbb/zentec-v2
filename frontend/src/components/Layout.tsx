import { Link, NavLink, Outlet } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { getCurrentUser } from "../lib/api";
import { LayoutDashboard, Calendar, User, Users, UserCircle, Shield } from "lucide-react";
import logo from "../../assets/zentec_logo_white.svg";
export default function Layout() {
  const user = useMemo(() => getCurrentUser(), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-[320px_1fr]">
      {/* Mobile Header */}
      <header className="lg:hidden bg-panel2 p-4 flex items-center justify-between border-b border-slate-700">
        <img src={logo} alt="Logo" className="w-32" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="relative w-6 h-5 z-[100] flex flex-col justify-center">
            <span className={`absolute block h-0.5 w-full bg-slate-200 rounded transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'rotate-45 top-1/2 -translate-y-1/2' 
                : 'top-0'
            }`}></span>
            <span className={`absolute block h-0.5 w-full bg-slate-200 rounded transition-all duration-300 ease-in-out top-1/2 -translate-y-1/2 ${
              mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}></span>
            <span className={`absolute block h-0.5 w-full bg-slate-200 rounded transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? '-rotate-45 top-1/2 -translate-y-1/2' 
                : 'bottom-0'
            }`}></span>
          </div>
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`bg-panel2 p-6 lg:p-10 flex flex-col gap-8 lg:gap-12 ${
        mobileMenuOpen ? 'block' : 'hidden'
      } lg:block ${mobileMenuOpen ? 'absolute inset-0 z-50 lg:relative lg:z-auto' : ''}`}>
        <div className="flex flex-col items-center gap-4 mb-8 lg:mb-12">
          <img src={logo} alt="Logo" className="w-[200px] hidden lg:block" />
        </div>
        <nav className="flex flex-col gap-3 lg:gap-5">
          <NavLink 
            className={({ isActive }) => 
              `px-4 lg:px-6 py-3 lg:py-5 rounded-lg text-lg lg:text-xl transition-all flex items-center gap-3 lg:gap-5 ${
                isActive 
                  ? 'bg-gradient-to-r from-[rgb(47,50,109)] to-[rgb(25,28,65)] text-white font-semibold shadow-lg' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            } 
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={22} className="lg:w-6 lg:h-6" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `px-4 lg:px-6 py-3 lg:py-5 rounded-lg text-lg lg:text-xl transition-all flex items-center gap-3 lg:gap-5 ${
                isActive 
                  ? 'bg-gradient-to-r from-[rgb(47,50,109)] to-[rgb(25,28,65)] text-white font-semibold shadow-lg' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            } 
            to="/schedule"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Calendar size={22} className="lg:w-6 lg:h-6" />
            <span>Appointments</span>
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `px-4 lg:px-6 py-3 lg:py-5 rounded-lg text-lg lg:text-xl transition-all flex items-center gap-3 lg:gap-5 ${
                isActive 
                  ? 'bg-gradient-to-r from-[rgb(47,50,109)] to-[rgb(25,28,65)] text-white font-semibold shadow-lg' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            } 
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={22} className="lg:w-6 lg:h-6" />
            <span>Doctors</span>
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `px-4 lg:px-6 py-3 lg:py-5 rounded-lg text-lg lg:text-xl transition-all flex items-center gap-3 lg:gap-5 ${
                isActive 
                  ? 'bg-gradient-to-r from-[rgb(47,50,109)] to-[rgb(25,28,65)] text-white font-semibold shadow-lg' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            } 
            to="/patients"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={22} className="lg:w-6 lg:h-6" />
            <span>Patients</span>
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `px-4 lg:px-6 py-3 lg:py-5 rounded-lg text-lg lg:text-xl transition-all flex items-center gap-3 lg:gap-5 ${
                isActive 
                  ? 'bg-gradient-to-r from-[rgb(47,50,109)] to-[rgb(25,28,65)] text-white font-semibold shadow-lg' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            } 
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
          >
            <UserCircle size={22} className="lg:w-6 lg:h-6" />
            <span>Profile</span>
          </NavLink>
          {user?.role === "super-admin" && (
            <div className="mt-4 lg:mt-8 border-t border-slate-700 pt-4 lg:pt-8">
              <NavLink 
                className={({ isActive }) => 
                  `px-4 lg:px-6 py-3 lg:py-5 rounded-lg text-lg lg:text-xl transition-all flex items-center gap-3 lg:gap-5 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[rgb(47,50,109)] to-[rgb(25,28,65)] text-white font-semibold shadow-lg' 
                      : 'hover:bg-slate-800 text-slate-300'
                  }`
                } 
                to="/superadmin"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield size={22} className="lg:w-6 lg:h-6" />
                <span>Super Admin</span>
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
      <main className="p-4 lg:p-6 overflow-auto flex-1">
        <Outlet />
      </main>
    </div>
  );
}

