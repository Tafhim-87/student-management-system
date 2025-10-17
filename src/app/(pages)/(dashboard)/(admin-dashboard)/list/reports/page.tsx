"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Printer,
  Search,
  Filter,
  X,
  BookOpen,
  FileText,
  Layers,
} from "lucide-react";
import useAuthGuard from "@/hooks/useAuthGuard";
import "react-toastify/dist/ReactToastify.css";
import DashboardNav from "@/components/admin-dashboard/DashboardNav";

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
  examType: string;
}

interface SubjectMarks {
  mcqScore: number;
  mcqTotal: number;
  cqScore: number;
  cqTotal: number;
}

const semesters = ["1st", "2nd", "3rd"] as const;
const examTypes = ["mcq", "cq", "combined"] as const;

const Page = () => {
  useAuthGuard();

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<{ [key: string]: string[] }>({});
  const [marks, setMarks] = useState<{
    [studentId: string]: { [subject: string]: SubjectMarks };
  }>({});
  const [selectedSemesters, setSelectedSemesters] = useState<{
    [studentId: string]: string;
  }>({});
  const [selectedExamTypes, setSelectedExamTypes] = useState<{
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
        if (error instanceof Error) {
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
  }, [students, searchTerm, classFilter, sectionFilter]);

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
      const resultsPromises = studentsData.map(async (student: Student) => {
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
            results: resultResponse.data.results
              ? [resultResponse.data.results]
              : [],
          };
        } catch (error) {
          return { studentId: student._id, results: [] };
        }
      });

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
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter) {
      filtered = filtered.filter((student) => student.class === classFilter);
    }

    // Section filter
    if (sectionFilter) {
      filtered = filtered.filter(
        (student) => student.section === sectionFilter
      );
    }

    setFilteredStudents(filtered);
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("");
    setSectionFilter("");
  };

  // ✅ Get unique classes and sections for filter options
  const uniqueClasses = [
    ...new Set(students.map((student) => student.class)),
  ].sort();
  const uniqueSections = [
    ...new Set(students.map((student) => student.section)),
  ].sort();

  // ✅ Fetch subjects for a student
  const fetchSubjects = async (
    student: Student,
    semester: string,
    examType: string
  ) => {
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

      // Initialize marks based on exam type
      const initialMarks: { [subject: string]: SubjectMarks } = {};
      res.data.subjects.forEach((sub: string) => {
        initialMarks[sub] = {
          mcqScore: 0,
          mcqTotal: examType === "cq" ? 0 : 30, // Default MCQ total for MCQ/Combined
          cqScore: 0,
          cqTotal: examType === "mcq" ? 0 : 70, // Default CQ total for CQ/Combined
        };
      });

      setMarks((prev) => ({
        ...prev,
        [student._id]: initialMarks,
      }));

      setSelectedSemesters((prev) => ({
        ...prev,
        [student._id]: semester,
      }));
      setSelectedExamTypes((prev) => ({
        ...prev,
        [student._id]: examType,
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
    field: keyof SubjectMarks,
    value: string
  ) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: {
          ...prev[studentId][subject],
          [field]: Number(value),
        },
      },
    }));
  };

  // ✅ Handle semester and exam type selection
  const handleExamSetup = (
    student: Student,
    semester: string,
    examType: string
  ) => {
    if (semester && examType) {
      fetchSubjects(student, semester, examType);
    } else {
      // Clear subjects and marks if no selection
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
      setSelectedExamTypes((prev) => ({
        ...prev,
        [student._id]: examType,
      }));
    }
  };

  // ✅ Check if semester and exam type combination is already submitted
  const isExamSubmitted = (
    studentId: string,
    semester: string,
    examType: string
  ) => {
    const studentResults = submittedResults[studentId] || [];
    return studentResults.some(
      (result) => result.semester === semester && result.examType === examType
    );
  };

  // ✅ Submit result based on exam type
  const handleSubmitResult = async (student: Student) => {
    try {
      setSubmitting(student._id);
      const selectedSemester = selectedSemesters[student._id];
      const selectedExamType = selectedExamTypes[student._id];

      // Double-check if exam is already submitted
      if (isExamSubmitted(student._id, selectedSemester, selectedExamType)) {
        toast.error(
          `❌ ${selectedExamType.toUpperCase()} for ${selectedSemester} semester already submitted for ${
            student.name
          }`
        );
        return;
      }

      const endpointMap = {
        mcq: "/submit/mcq",
        cq: "/submit/cq",
        combined: "/submit/combined",
      };

      const payload = {
        studentId: student._id,
        className: student.class,
        semester: selectedSemester,
        marks: marks[student._id] || {},
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${
          endpointMap[selectedExamType as keyof typeof endpointMap]
        }`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      toast.success(
        `✅ ${selectedExamType.toUpperCase()} result submitted for ${
          student.name
        } (${selectedSemester} semester)`
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
      setSelectedExamTypes((prev) => {
        const newExamTypes = { ...prev };
        delete newExamTypes[student._id];
        return newExamTypes;
      });

      // Update submitted results
      setSubmittedResults((prev) => ({
        ...prev,
        [student._id]: [
          ...(prev[student._id] || []),
          {
            semester: selectedSemester,
            examType: selectedExamType,
            _id: res.data.data._id,
          },
        ],
      }));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`❌ Failed to submit result: ${error.message}`);
      } else {
        toast.error("❌ Failed to submit result.");
      }
      console.error("Error submitting result:", error);
    } finally {
      setSubmitting(null);
    }
  };

  // ✅ Get available exam types for a student and semester
  const getAvailableExamTypes = (studentId: string, semester: string) => {
    const studentResults = submittedResults[studentId] || [];
    const submittedExamTypes = studentResults
      .filter((result) => result.semester === semester)
      .map((result) => result.examType);

    return examTypes.filter((type) => !submittedExamTypes.includes(type));
  };

  // ✅ Get exam type icon
  const getExamTypeIcon = (examType: string) => {
    switch (examType) {
      case "mcq":
        return <BookOpen className="h-4 w-4" />;
      case "cq":
        return <FileText className="h-4 w-4" />;
      case "combined":
        return <Layers className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // ✅ Get exam type badge color
  const getExamTypeBadgeColor = (examType: string) => {
    switch (examType) {
      case "mcq":
        return "bg-blue-100 text-blue-800";
      case "cq":
        return "bg-green-100 text-green-800";
      case "combined":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        {error ||
          "Access Denied: Only super admins and admins can view this page."}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 mx-auto">
      <DashboardNav />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Student Results Management
        </h1>
        <Badge variant="secondary" className="text-sm">
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "Student" : "Students"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {uniqueSections.map((section, index) => (
                  <option key={index} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
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
            <p className="text-gray-500 text-lg">
              No students found matching your filters.
            </p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        filteredStudents.map((student) => {
          const submittedResultsList = submittedResults[student._id] || [];

          return (
            <Card key={student._id} className="border-l-4 border-l-blue-500">
              <CardContent >
                {/* Student Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {student.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        Roll: <strong>{student.roll}</strong>
                      </span>
                      <span>
                        Class: <strong>{student.class}</strong>
                      </span>
                      <span>
                        Section: <strong>{student.section}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Print Result Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/list/${student._id}`)}
                    className="flex items-center gap-2"
                    disabled={submittedResultsList.length === 0}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>

                {/* Submitted Results */}
                {submittedResultsList.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Submitted results:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {submittedResultsList.map((result) => (
                        <Badge
                          key={`${result.semester}-${result.examType}`}
                          variant="secondary"
                          className={`${getExamTypeBadgeColor(
                            result.examType
                          )} flex items-center gap-1`}
                        >
                          {getExamTypeIcon(result.examType)}
                          {result.semester} {result.examType.toUpperCase()} ✓
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Semester Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Semester
                    </label>
                    <select
                      value={selectedSemesters[student._id] || ""}
                      onChange={(e) => {
                        const semester = e.target.value;
                        setSelectedSemesters((prev) => ({
                          ...prev,
                          [student._id]: semester,
                        }));
                        // Clear exam type when semester changes
                        setSelectedExamTypes((prev) => ({
                          ...prev,
                          [student._id]: "",
                        }));
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((semester) => (
                        <option key={semester} value={semester}>
                          {semester} Semester
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Type Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Exam Type
                    </label>
                    <select
                      value={selectedExamTypes[student._id] || ""}
                      onChange={(e) => {
                        const examType = e.target.value;
                        const semester = selectedSemesters[student._id];
                        if (semester && examType) {
                          handleExamSetup(student, semester, examType);
                        }
                      }}
                      disabled={!selectedSemesters[student._id]}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Exam Type</option>
                      {selectedSemesters[student._id] &&
                        getAvailableExamTypes(
                          student._id,
                          selectedSemesters[student._id]
                        ).map((examType) => (
                          <option key={examType} value={examType}>
                            {examType.toUpperCase()} Exam
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Subjects Form */}
                {subjects[student._id] && selectedExamTypes[student._id] && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitResult(student);
                    }}
                    className="mt-6 space-y-4"
                  >
                    <h4 className="font-semibold text-gray-900">
                      Enter Marks for {selectedSemesters[student._id]} Semester
                      ({selectedExamTypes[student._id].toUpperCase()})
                    </h4>

                    {/* number card */}

                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="font-semibold text-gray-900">
                                Subject
                              </TableHead>
                              {(selectedExamTypes[student._id] === "mcq" ||
                                selectedExamTypes[student._id] ===
                                  "combined") && (
                                <TableHead className="font-semibold text-gray-900 text-center">
                                  MCQ Score
                                </TableHead>
                              )}
                              {(selectedExamTypes[student._id] === "cq" ||
                                selectedExamTypes[student._id] ===
                                  "combined") && (
                                <TableHead className="font-semibold text-gray-900 text-center">
                                  CQ Score
                                </TableHead>
                              )}
                              <TableHead className="font-semibold text-gray-900 text-center">
                                Total
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subjects[student._id].map((subject) => (
                              <TableRow
                                key={subject}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="font-medium text-gray-900">
                                  {subject}
                                </TableCell>

                                {/* MCQ Score */}
                                {(selectedExamTypes[student._id] === "mcq" ||
                                  selectedExamTypes[student._id] ===
                                    "combined") && (
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={30}
                                      value={
                                        marks[student._id]?.[subject]
                                          ?.mcqScore || ""
                                      }
                                      onChange={(e) =>
                                        handleMarkChange(
                                          student._id,
                                          subject,
                                          "mcqScore",
                                          e.target.value
                                        )
                                      }
                                      className="w-full text-center"
                                      required
                                    />
                                  </TableCell>
                                )}

                                {/* CQ Score */}
                                {(selectedExamTypes[student._id] === "cq" ||
                                  selectedExamTypes[student._id] ===
                                    "combined") && (
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={70}
                                      value={
                                        marks[student._id]?.[subject]
                                          ?.cqScore || ""
                                      }
                                      onChange={(e) =>
                                        handleMarkChange(
                                          student._id,
                                          subject,
                                          "cqScore",
                                          e.target.value
                                        )
                                      }
                                      className="w-full text-center"
                                      required
                                    />
                                  </TableCell>
                                )}

                                {/* Total */}
                                <TableCell className="text-center font-semibold">
                                  {(marks[student._id]?.[subject]?.mcqScore ||
                                    0) +
                                    (marks[student._id]?.[subject]?.cqScore ||
                                      0)}
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* Summary Row */}
                            <TableRow className="bg-gray-50 font-semibold">
                              <TableCell className="text-right">
                                Totals:
                              </TableCell>
                              {(selectedExamTypes[student._id] === "mcq" ||
                                selectedExamTypes[student._id] ===
                                  "combined") && (
                                <TableCell className="text-center">
                                  {subjects[student._id].reduce(
                                    (sum, subject) =>
                                      sum +
                                      (marks[student._id]?.[subject]
                                        ?.mcqScore || 0),
                                    0
                                  )}
                                </TableCell>
                              )}
                              {(selectedExamTypes[student._id] === "cq" ||
                                selectedExamTypes[student._id] ===
                                  "combined") && (
                                <TableCell className="text-center">
                                  {subjects[student._id].reduce(
                                    (sum, subject) =>
                                      sum +
                                      (marks[student._id]?.[subject]?.cqScore ||
                                        0),
                                    0
                                  )}
                                </TableCell>
                              )}
                              <TableCell className="text-center text-blue-600">
                                {subjects[student._id].reduce(
                                  (sum, subject) =>
                                    sum +
                                    (marks[student._id]?.[subject]?.mcqScore ||
                                      0) +
                                    (marks[student._id]?.[subject]?.cqScore ||
                                      0),
                                  0
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Fixed Totals Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        {(selectedExamTypes[student._id] === "mcq" ||
                          selectedExamTypes[student._id] === "combined") && (
                          <div className="text-center p-2 bg-blue-50 rounded">
                            MCQ Total per subject: <strong>30</strong>
                          </div>
                        )}
                        {(selectedExamTypes[student._id] === "cq" ||
                          selectedExamTypes[student._id] === "combined") && (
                          <div className="text-center p-2 bg-green-50 rounded">
                            CQ Total per subject: <strong>70</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting === student._id}
                      className="w-full md:w-auto"
                    >
                      {submitting === student._id
                        ? "Submitting..."
                        : `Submit ${selectedExamTypes[
                            student._id
                          ].toUpperCase()} Result`}
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
