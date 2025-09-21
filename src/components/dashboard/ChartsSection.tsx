// components/dashboard/ChartsSection.tsx
"use client";

import { useState, useEffect } from "react";
import useApi from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";


export default function ChartsSection() {
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([]);
  const { get, loading } = useApi();

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    const data = await get("/chart-data");
    if (Array.isArray(data)) {
      setChartData(data);
    } else {
      setChartData([]);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}