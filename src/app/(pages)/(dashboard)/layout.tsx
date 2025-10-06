import type { Metadata } from "next";
import "@/app/globals.css";
import SideNav from "@/components/ui/SideNav";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Manage students, classes, and payments efficiently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="">
      <SideNav>{children} <ToastContainer /></SideNav>
    </main>
  );
}
