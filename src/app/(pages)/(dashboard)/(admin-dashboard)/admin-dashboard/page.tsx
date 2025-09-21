"use client";

import { useState, useEffect } from "react";
import useApi from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthGuard from "@/hooks/useAuthGuard";
import DashboardNav from "@/components/admin-dashboard/DashboardNav";
import StudentList from "@/components/admin-dashboard/StudentList";
import TeacherList from "@/components/admin-dashboard/TeacherList";
import { Users, GraduationCap } from 'lucide-react';

// Define types for our data
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Student {
  _id: string;
  name: string;
  userName: string;
  roll: string;
  class: string;
  section?: string;
  createdAt: string;
}

// interface DashboardStats {
//   totalTeachers: number;
//   totalStudents: number;
//   activeStudents: number;
//   inactiveStudents: number;
// }

interface TooltipPayload {
  name: string;
  value: number;
  dataKey: string;
  fill: string;
}

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
  const [teachers, setTeachers] = useState<User[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const api = useApi();

  useAuthGuard();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch teachers
        const teachersResponse = await api.get('/users') as { users: User[] };
        const teachersData = teachersResponse?.users || [];
        
        // Filter only teachers (assuming role 'teacher' exists)
        const filteredTeachers = teachersData.filter(user => 
          user.role === 'teacher' || user.role === 'Teacher'
        );
        setTeachers(filteredTeachers);

        // five recent teachers
        const recentTeachers = filteredTeachers.slice(0, 5);
        setRecentTeachers(recentTeachers);
        
        // Fetch students
        const studentsResponse = await api.get('/student') as { students: Student[] };
        const studentsData = studentsResponse?.students || [];
        setStudents(studentsData);

        // five recent students
        const recentStudents = studentsData.slice(0, 5);
        setRecentStudents(recentStudents);
        
        
        // Prepare chart data
        setChartData([
          { name: 'Teachers', count: filteredTeachers.length },
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
      <div className="p-6">
        <DashboardNav />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DashboardNav />

      {/* Dashboard Statistics */}
      <div className="my-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow-md">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Teachers</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">{teachers.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-md">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold">Students</h3>
            </div>
            <p className="text-2xl font-semibold mt-2">{students.length}</p>
          </div>
        </div>
      </div>
      
      {/* Statistics Chart */}
      <Card className="mb-6">
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

      {/* Teachers and Students Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teachers ({teachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeacherList teachers={recentTeachers} />
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudentList students={recentStudents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}