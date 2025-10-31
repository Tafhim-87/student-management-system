"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useApi from "@/hooks/useApi";
import {
  Menu,
  X,
  HomeIcon,
  NotebookText,
  PrinterCheck,
  GraduationCap,
} from "lucide-react";

// Define the expected response type from the /profile API
interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string; // e.g., 'super_admin', 'admin', 'teacher'
  };
}

// Different navs for each role
const superAdminNav = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon size={20} /> },
  { name: "Reports", path: "/list/reports", icon: <NotebookText size={20} /> },
];

const adminNav = [
  { name: "Dashboard", path: "/admin-dashboard", icon: <HomeIcon size={20} /> },
  { name: "Teachers", path: "/list/teachers", icon: <NotebookText size={20} /> },
  { name: "Students", path: "/list/students", icon: <GraduationCap size={20} /> },
  { name: "Reports", path: "/list/reports", icon: <NotebookText size={20} /> },
  { name: "Payments", path: "/list/payment", icon: <PrinterCheck size={20} /> },
];

const teacherNav = [
  { name: "Dashboard", path: "/teacher-dashboard", icon: <HomeIcon size={20} /> },
  { name: "Reports", path: "/list/reports", icon: <NotebookText size={20} /> }, 
];

const studentNav = [
  { name: "Result", path: "/student-result", icon: <HomeIcon size={20} /> },
];

export default function SideNav({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Fetch user role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/profile") as ProfileResponse;
        setRole(res?.user?.role ?? null); 
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setRole(null); // Set role to null on error
      }
    };
    fetchUser();
  }, [api.get]); // Add api.get as dependency for safety

  // Select nav items based on role
  let navItems = teacherNav; // default fallback
  if (role === "super_admin") navItems = superAdminNav;
  else if (role === "admin") navItems = adminNav;
  else if (role === "teacher") navItems = teacherNav;
  else if (role === "student") navItems = studentNav;

  return (
    <section className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 shadow-lg transform bg-white transition-transform duration-300 
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <h1 className="text-lg font-bold">{role?.toUpperCase()} DASHBOARD</h1>
          <button
            className="md:hidden text-gray-400 hover:text-gray-200"
            onClick={() => setOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4 space-y-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ease-out
                ${
                  pathname === item.path
                    ? "bg-[#006769] shadow-lg text-white"
                    : "hover:bg-[#a3a3a3ab] hover:shadow-lg hover:scale-[1.02] hover:backdrop-blur-md"
                }`}
              onClick={() => setOpen(false)}
            >
              <span className="relative z-10 text-lg">{item.icon}</span>
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Tafhim Hasan
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        className={`fixed top-4 left-4 z-50 p-2 bg-[#3d3d3d87] text-gray-200 shadow rounded-md md:hidden ${
          open ? "hidden" : ""
        }`}
        aria-label="Open sidebar"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[#00000080] z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <main className={`md:ml-64 ${open ? "mt-0" : "mt-14 md:mt-0"}`}>
        {children}
      </main>
    </section>
  );
}