"use client";
import { useState, useEffect } from "react";
import useApi from "@/hooks/useApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  Mail,
  Calendar,
  MoreVertical,
  Eye,
} from "lucide-react";
import DashboardNav from "@/components/admin-dashboard/DashboardNav";
import type { Teacher, TeachersResponse } from "@/types/types";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function TeacherDashboard() {

  useAuthGuard();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [filters, setFilters] = useState({
    class: "all",
    section: "all",
    search: "",
  });
  const [activeTab, setActiveTab] = useState("all");

  const { get, loading, error } = useApi<TeachersResponse>();

  const fetchTeachers = async () => {
    const params = new URLSearchParams();
    if (filters.class && filters.class !== "all")
      params.append("class", filters.class);
    if (filters.section && filters.section !== "all")
      params.append("section", filters.section);

    const queryString = params.toString();
    const url = `/teachers${queryString ? `?${queryString}` : ""}`;

    const data = await get(url);
    if (data?.teachers) {
      setTeachers(data.teachers);
      setFilteredTeachers(data.teachers);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    let results = teachers;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(
        (teacher) =>
          teacher.firstName.toLowerCase().includes(searchTerm) ||
          teacher.lastName.toLowerCase().includes(searchTerm) ||
          teacher.email.toLowerCase().includes(searchTerm) ||
          teacher.assignedClasses.some((cls) =>
            cls.subject?.toLowerCase().includes(searchTerm)
          )
      );
    }

    // Apply tab filter
    if (activeTab === "withClasses") {
      results = results.filter((teacher) => teacher.assignedClasses.length > 0);
    } else if (activeTab === "withoutClasses") {
      results = results.filter(
        (teacher) => teacher.assignedClasses.length === 0
      );
    }

    setFilteredTeachers(results);
  }, [teachers, filters.search, activeTab]);

  const handleClearFilters = () => {
    setFilters({ class: "all", section: "all", search: "" });
    setActiveTab("all");
    fetchTeachers();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRandomColor = (str: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
    ];
    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <DashboardNav />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and view all teachers in your institution
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border">
          <Users className="h-6 w-6 text-blue-600" />
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {filteredTeachers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Teachers</div>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher._id}
            className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-t-4 border-t-blue-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-2xl transition-all group-hover:bg-blue-500/20" />

            <CardHeader className="pb-3 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar
                    className={`h-14 w-14 ${getRandomColor(
                      teacher.firstName
                    )} text-white shadow-lg`}
                  >
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(teacher.firstName, teacher.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                      {teacher.firstName} {teacher.lastName}
                    </CardTitle>
                    <CardDescription className="truncate flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <Badge
                  variant="secondary"
                  className="capitalize text-xs px-2 py-1"
                >
                  {teacher.role.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(teacher.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {/* Assigned Classes */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Assigned Classes
                  <Badge variant="outline" className="ml-1 text-xs">
                    {teacher.assignedClasses.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {teacher.assignedClasses.length > 0 ? (
                    teacher.assignedClasses.map((cls, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 group/item hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">
                            Class {cls.class} - {cls.section}
                          </span>
                        </div>
                        {cls.subject && (
                          <Badge
                            variant="default"
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            {cls.subject}
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic p-3 bg-muted/50 rounded-lg text-center border">
                      No classes assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Created By */}
              {teacher.createdBy && (
                <div className="pt-3 border-t border-dashed">
                  <div className="text-xs text-muted-foreground mb-1">
                    Added by
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          teacher.createdBy.firstName,
                          teacher.createdBy.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">
                      {teacher.createdBy.firstName} {teacher.createdBy.lastName}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group/btn"
                >
                  <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && !loading && !error && (
        <Card className="text-center py-12 border-dashed border-2">
          <CardContent>
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
              No teachers found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filters.search ||
              filters.class !== "all" ||
              filters.section !== "all"
                ? "No teachers match your current search or filters. Try adjusting your criteria."
                : "There are no teachers available in your institution yet."}
            </p>
            {(filters.search ||
              filters.class !== "all" ||
              filters.section !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Unable to load teachers
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={fetchTeachers}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
