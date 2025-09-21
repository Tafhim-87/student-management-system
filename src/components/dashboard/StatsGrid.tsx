// components/dashboard/StatsGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, UserCheck, GraduationCap } from "lucide-react";

interface StatsGridProps {
  stats: {
    adminCount: number;
    teacherCount: number;
    studentCount: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: "Total Admins",
      value: stats.adminCount,
      icon: UserCog,
      color: "text-blue-500",
    },
    {
      title: "Total Teachers",
      value: stats.teacherCount,
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Total Students",
      value: stats.studentCount,
      icon: GraduationCap,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}