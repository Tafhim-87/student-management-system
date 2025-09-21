// components/dashboard/Dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import useApi from "@/hooks/useApi";
import DashboardNav from "@/components/dashboard/DashboardNav";
import StatsGrid from "@/components/dashboard/StatsGrid";
import AdminList from "@/components//dashboard/AdminList";
import ChartsSection from "@/components/dashboard/ChartsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthGuard from "@/hooks/useAuthGuard";

interface DashboardStats {
  adminCount: number;
  teacherCount: number;
  studentCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { get, loading, error } = useApi();

  useAuthGuard();

  const fetchStats = useCallback(async () => {
    try {
      const data = await get("/stats");
      if (data && typeof data === 'object') {
  setStats(data as DashboardStats);
}
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [get]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 w-full">
        <div className="container flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={fetchStats}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section>
      <div className="min-h-screen">
      <DashboardNav />
      <div className="p-6 space-y-6">
        {stats && <StatsGrid stats={stats} />}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminList />
          <ChartsSection />
        </div>
      </div>
    </div>
    </section>
  );
}