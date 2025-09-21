"use client";

import { useState, useEffect } from "react";
import useApi from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalTeachers: number;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

// Define type for Recharts tooltip payload
interface TooltipPayload {
  name: string;
  value: number;
  dataKey: string;
  fill: string;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function ChartsSection() {
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([]);
  const [, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch teachers
        const teachersResponse = await api.get('/users') as { users: User[] };
        const teachersData = teachersResponse?.users || [];
        
        // Fetch students
        const studentsResponse = await api.get('/student') as { students: Student[] };
        const studentsData = studentsResponse?.students || [];
        
        // Calculate statistics
        const activeStudents = studentsData.filter((student: Student) => 
          student.status === 'active' || student.status === 'enrolled'
        ).length;
        
        const inactiveStudents = studentsData.length - activeStudents;
        
        // Set stats
        setStats({
          totalTeachers: teachersData.length,
          totalStudents: studentsData.length,
          activeStudents,
          inactiveStudents
        });
        
        // Prepare chart data
        setChartData([
          { name: 'Teachers', count: teachersData.length },
          { name: 'Students', count: studentsData.length },
        ]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                name="Count"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}