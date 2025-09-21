"use client";
import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import UseAuthGuard from "@/hooks/useAuthGuard";

const page = () => {
  UseAuthGuard();
  return (
    <section className="w-full flex items-center justify-center">
      <div className="w-full"><Dashboard /></div>
    </section>
  );
};

export default page;
