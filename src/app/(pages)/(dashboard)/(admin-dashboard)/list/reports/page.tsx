"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { Printer, Search, Filter, X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

interface Student {
  _id: string;
  name: string;
  roll: string;
  class: string;
  section: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Result {
  semester: string;
  _id: string;
}

const semesters = ["1st", "2nd", "3rd"] as const;

const Page = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<{ [key: string]: string[] }>({});
  const [marks, setMarks] = useState<{
    [studentId: string]: { [subject: string]: number };
  }>({});
  const [selectedSemesters, setSelectedSemesters] = useState<{
    [studentId: string]: string;
  }>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedResults, setSubmittedResults] = useState<{
    [studentId: string]: Result[];
  }>({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [rollFilter, setRollFilter] = useState("");

  const router = useRouter();

  // ✅ Fetch user details to check role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please sign in.");
          setIsLoadingUser(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.user);
        setIsLoadingUser(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        if(error instanceof Error) {
          setError(error.message || "Failed to fetch user data");
        } else {
          setError("Failed to fetch user data");
        }
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch students and results
  useEffect(() => {
    if (user?.role === "super_admin" || user?.role === "admin") {
      fetchStudentsAndResults();
    }
  }, [user]);

  // ✅ Apply filters whenever filters or students change
  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, classFilter, sectionFilter, rollFilter]);

  const fetchStudentsAndResults = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/student`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const studentsData = response.data.students || [];
      setStudents(studentsData);

      // Fetch results for each student to check submitted semesters
      const resultsPromises = studentsData.map(
        async (student: Student) => {
          try {
            const resultResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/results/${student._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }
            );
            return {
              studentId: student._id,
              results: resultResponse.data.results ? [resultResponse.data.results] : [],
            };
          } catch (error) {
            if(error instanceof Error) {
              console.error(`Error fetching results for ${student.name}:`, error.message);
            } else {
              console.error(`Error fetching results for ${student.name}:`, error);
            }
            return { studentId: student._id, results: [] };
          }
        }
      );

      const results = await Promise.all(resultsPromises);
      const submittedResultsMap = results.reduce(
        (acc, { studentId, results }) => ({
          ...acc,
          [studentId]: results,
        }),
        {}
      );
      setSubmittedResults(submittedResultsMap);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students.");
    }
  };

  // ✅ Apply filters
  const applyFilters = () => {
    let filtered = students;

    // Search filter (name)
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter) {
      filtered = filtered.filter(student => student.class === classFilter);
    }

    // Section filter
    if (sectionFilter) {
      filtered = filtered.filter(student => student.section === sectionFilter);
    }

    // Roll filter
    if (rollFilter) {
      filtered = filtered.filter(student => student.roll.includes(rollFilter));
    }

    setFilteredStudents(filtered);
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("");
    setSectionFilter("");
    setRollFilter("");
  };

  // ✅ Get unique classes and sections for filter options
  const uniqueClasses = [...new Set(students.map(student => student.class))].sort();
  const uniqueSections = [...new Set(students.map(student => student.section))].sort();

  // ✅ Fetch subjects for a student
  const fetchSubjects = async (student: Student, semester: string) => {
    try {
      setLoading(student._id);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/${student.class}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setSubjects((prev) => ({
        ...prev,
        [student._id]: res.data.subjects,
      }));
      setMarks((prev) => ({
        ...prev,
        [student._id]: res.data.subjects.reduce((acc: { [key: string]: number }, sub: string) => {
          acc[sub] = 0;
          return acc;
        }, {}),
      }));
      setSelectedSemesters((prev) => ({
        ...prev,
        [student._id]: semester,
      }));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to fetch subjects.");
    } finally {
      setLoading(null);
    }
  };

  // ✅ Handle marks change
  const handleMarkChange = (
    studentId: string,
    subject: string,
    value: string
  ) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: Number(value),
      },
    }));
  };

  // ✅ Handle semester selection
  const handleSemesterChange = (student: Student, semester: string) => {
    if (semester) {
      fetchSubjects(student, semester);
    } else {
      // Clear subjects and marks if no semester is selected
      setSubjects((prev) => {
        const newSubjects = { ...prev };
        delete newSubjects[student._id];
        return newSubjects;
      });
      setMarks((prev) => {
        const newMarks = { ...prev };
        delete newMarks[student._id];
        return newMarks;
      });
      setSelectedSemesters((prev) => ({
        ...prev,
        [student._id]: semester,
      }));
    }
  };

  // ✅ Check if semester is already submitted
  const isSemesterSubmitted = (studentId: string, semester: string) => {
    const studentResults = submittedResults[studentId] || [];
    return studentResults.some(result => result.semester === semester);
  };

  // ✅ Submit result
  const handleSubmitResult = async (student: Student) => {
    try {
      setSubmitting(student._id);
      const selectedSemester = selectedSemesters[student._id];
      
      // Double-check if semester is already submitted (client-side validation)
      if (isSemesterSubmitted(student._id, selectedSemester)) {
        toast.error(`❌ ${selectedSemester} semester already submitted for ${student.name}`);
        return;
      }

      const payload = {
        studentId: student._id,
        classNumber: Number(student.class),
        semester: selectedSemester,
        scores: marks[student._id] || {},
      };
      
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      
      toast.success(
        `✅ Result submitted for ${student.name} (${selectedSemester} semester)`
      );
      
      // Clear form
      setMarks((prev) => {
        const newMarks = { ...prev };
        delete newMarks[student._id];
        return newMarks;
      });
      setSubjects((prev) => {
        const newSubjects = { ...prev };
        delete newSubjects[student._id];
        return newSubjects;
      });
      setSelectedSemesters((prev) => {
        const newSemesters = { ...prev };
        delete newSemesters[student._id];
        return newSemesters;
      });
      
      // Update submitted results
      setSubmittedResults((prev) => ({
        ...prev,
        [student._id]: [
          ...(prev[student._id] || []),
          { semester: selectedSemester, _id: res.data.data._id },
        ],
      }));
      
    } catch (error) {
      if(error instanceof Error) {
        toast.error(`❌ Failed to submit result: ${error.message}`);
      } else {
        toast.error("❌ Failed to submit result.");
      }
      console.error("Error submitting result:", error);
    } finally {
      setSubmitting(null);
    }
  };

  // ✅ Handle loading and unauthorized states
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || (user?.role !== "super_admin" && user?.role !== "admin")) {
    return (
      <div className="text-red-500 text-center p-8">
        {error || "Access Denied: Only super admins and admins can view this page."}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Results Management</h1>
        <Badge variant="secondary" className="text-sm">
          {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
        </Badge>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search by Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All classes</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All sections</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Roll Number</label>
              <Input
                placeholder="Roll number..."
                value={rollFilter}
                onChange={(e) => setRollFilter(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">Actions</label>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No students found matching your filters.</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        filteredStudents.map((student) => {
          const submittedSemesters = submittedResults[student._id]?.map((r) => r.semester) || [];
          const availableSemesters = semesters.filter(
            (semester) => !submittedSemesters.includes(semester)
          );

          return (
            <Card key={student._id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                {/* Student Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span>Roll: <strong>{student.roll}</strong></span>
                      <span>Class: <strong>{student.class}</strong></span>
                      <span>Section: <strong>{student.section}</strong></span>
                    </div>
                  </div>
                  
                  {/* Semester Selection */}
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedSemesters[student._id] || ""}
                      onChange={(e) => handleSemesterChange(student, e.target.value)}
                      disabled={loading === student._id || availableSemesters.length === 0}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {availableSemesters.length === 0 
                          ? "All semesters submitted" 
                          : "Select Semester"}
                      </option>
                      {availableSemesters.map((semester) => (
                        <option key={semester} value={semester}>
                          {semester} Semester
                        </option>
                      ))}
                    </select>

                    {/* Print Result Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/list/${student._id}`)}
                      className="flex items-center gap-2"
                      disabled={submittedSemesters.length === 0}
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>

                {/* Submitted Semesters */}
                {submittedSemesters.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Submitted semesters:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {submittedSemesters.map((semester) => (
                        <Badge key={semester} variant="secondary" className="bg-green-100 text-green-800">
                          {semester} Semester ✓
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subjects Form */}
                {subjects[student._id] && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitResult(student);
                    }}
                    className="mt-6 space-y-4"
                  >
                    <h4 className="font-semibold text-gray-900">
                      Enter Marks for {selectedSemesters[student._id]} Semester:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {subjects[student._id].map((sub) => (
                        <div key={sub} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">{sub}</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={marks[student._id]?.[sub] || ""}
                            onChange={(e) =>
                              handleMarkChange(student._id, sub, e.target.value)
                            }
                            placeholder="0-100"
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        submitting === student._id ||
                        !selectedSemesters[student._id]
                      }
                      className="w-full md:w-auto"
                    >
                      {submitting === student._id
                        ? "Submitting..."
                        : `Submit ${selectedSemesters[student._id]} Semester Result`}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
      <ToastContainer />
    </div>
  );
};

export default Page;