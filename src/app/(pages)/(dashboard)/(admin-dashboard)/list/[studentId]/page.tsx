// app/result/print/[studentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Printer, ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import axios from "axios";
import { ResultResponse } from "@/types/types";

export default function ResultPrintPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  
  const [resultData, setResultData] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [studentId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/results/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResultData(response.data);
    } catch (err) {
      console.error("Error fetching result:", err);
      if(err instanceof Error) {
        setError(err.message || "Failed to fetch result data");
      } else {
        setError("Failed to fetch result data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleDownloadPDF = () => {
    handlePrint();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+": return "bg-green-100 text-green-800 border-green-200";
      case "A": return "bg-green-50 text-green-700 border-green-100";
      case "A-": return "bg-blue-100 text-blue-800 border-blue-200";
      case "B+": return "bg-blue-50 text-blue-700 border-blue-100";
      case "B": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "C+": return "bg-orange-100 text-orange-800 border-orange-200";
      case "C": return "bg-orange-50 text-orange-700 border-orange-100";
      case "D": return "bg-red-100 text-red-800 border-red-200";
      case "F": return "bg-red-500 text-white border-red-600";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOverallGrade = (gpa: number, marks: { subject: string; score: number; grade: string; gpa: number }[]) => {
    // Check if any subject has failed (grade "F")
    const hasFailedSubject = marks.some(mark => mark.grade === "F");
    
    if (hasFailedSubject) {
      return "FAIL";
    }
    
    if (gpa >= 4.5) return "A+";
    if (gpa >= 4.0) return "A";
    if (gpa >= 3.5) return "B+";
    if (gpa >= 3.0) return "B";
    if (gpa >= 2.5) return "C+";
    if (gpa >= 2.0) return "C";
    if (gpa >= 1.0) return "D";
    return "F";
  };

  const hasFailedSubject = resultData?.results.marks.some(mark => mark.grade === "F") || false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading result data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchResult} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No result data available</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, results } = resultData;
  const overallGrade = getOverallGrade(results.averageGPA, results.marks);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white print:h-screen">
      {/* Header with Controls - Hidden during print */}
      <div className="bg-white border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Result</h1>
                <p className="text-gray-600">
                  {student.name} - Class {student.class} - Roll {student.roll}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleDownloadPDF} 
                variant="outline"
                disabled={isPrinting}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isPrinting ? "Preparing..." : "Download PDF"}
              </Button>
              <Button 
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {isPrinting ? "Printing..." : "Print Result"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Content - Optimized for single page printing */}
      <div className="container mx-auto px-4 py-4 print:py-0 print:px-0 print:max-w-none suse-mono">
        <Card className="w-full max-w-4xl mx-auto print:shadow-none print:border-0 print:bg-transparent print:max-w-none print:mx-0 print:w-full print:min-h-screen print:flex print:flex-col print:justify-between">
          <CardContent className="p-6 print:p-8 print:space-y-4 print:flex-1">
            {/* Header Section - Compact */}
            <div className="text-center border-b pb-4 print:pb-2 print:border-b-2">
              <CardTitle className="text-2xl print:text-xl font-bold text-gray-900 mb-2 print:mb-1">
                ACADEMIC TRANSCRIPT
              </CardTitle>
              <div className="space-y-1 text-sm print:text-xs text-gray-600">
                <p className="font-semibold text-base print:text-sm">Springfield International School</p>
                <p>123 Education Road, Springfield, SP 12345</p>
              </div>
            </div>

            {/* Student Information - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2 print:text-xs bg-gray-50 print:bg-transparent p-3 print:p-0 rounded print:rounded-none mt-4 print:mt-2">
              <div className="space-y-1">
                <div className="flex-1">
                  <span className="font-semibold w-28 print:w-24">Student Name: </span>
                  <span className="text-gray-900">{student.name}</span>
                </div>
                <div className="flex-1">
                  <span className="font-semibold w-28 print:w-24">Roll Number: </span>
                  <span className="text-gray-900">{student.roll}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-28 print:w-24">Class: </span>
                  <span className="text-gray-900">{student.class}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="font-semibold w-28 print:w-24">Section: </span>
                  <span className="text-gray-900">{student.section}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-28 print:w-24">Semester: </span>
                  <span className="text-gray-900">{results.semester}</span>
                </div>
                <div className="flex-1">
                  <span className="font-semibold w-28 print:w-24">Academic Year: </span>
                  <span className="text-gray-900">{new Date().getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Marks Table - Compact */}
            <div className="border rounded print:border-0 overflow-hidden mt-4 print:mt-2">
              <Table className="print:text-xs">
                <TableHeader className="bg-gray-50 print:bg-gray-100">
                  <TableRow>
                    <TableHead className="w-8 print:w-6 font-semibold print:text-xs">#</TableHead>
                    <TableHead className="font-semibold print:text-xs">Subject</TableHead>
                    <TableHead className="text-center font-semibold print:text-xs">Score</TableHead>
                    <TableHead className="text-center font-semibold print:text-xs">Grade</TableHead>
                    <TableHead className="text-center font-semibold print:text-xs">GPA</TableHead>
                    <TableHead className="text-center font-semibold print:text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.marks.map((mark, index) => (
                    <TableRow key={mark.subject} className="hover:bg-gray-50 print:border-b">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium text-gray-900">{mark.subject}</TableCell>
                      <TableCell className="text-center font-semibold">{mark.score}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className={`${getGradeColor(mark.grade)} print:bg-transparent print:border print:border-current text-xs print:text-xs`}
                        >
                          {mark.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-blue-600">
                        {mark.gpa}
                      </TableCell>
                      <TableCell className="text-center">
                        {mark.grade === "F" ? (
                          <Badge variant="destructive" className="text-xs print:text-xs print:bg-transparent print:border print:border-red-500 print:text-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1 print:h-2 print:w-2" />
                            Fail
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs print:text-xs text-green-600 print:text-green-600">
                            Pass
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary Section - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2 print:text-xs mt-4 print:mt-2">
              <Card className="text-center print:shadow-none print:border print:border-gray-300">
                <CardContent className="p-3 print:p-2">
                  <p className="font-semibold text-gray-600 mb-1 print:text-xs">Total Marks</p>
                  <p className="text-xl print:text-lg font-bold text-blue-600">
                    {results.totalMarks}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">out of {results.marks.length * 100}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center print:shadow-none print:border print:border-gray-300">
                <CardContent className="p-3 print:p-2">
                  <p className="font-semibold text-gray-600 mb-1 print:text-xs">Average GPA</p>
                  <p className="text-xl print:text-lg font-bold text-green-600">
                    {results.averageGPA}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">on a 5.0 scale</p>
                </CardContent>
              </Card>
              
              <Card className={`text-center print:shadow-none print:border ${
                overallGrade === "FAIL" ? "print:border-red-500" : "print:border-gray-300"
              }`}>
                <CardContent className="p-3 print:p-2">
                  <p className="font-semibold text-gray-600 mb-1 print:text-xs">Overall Result</p>
                  <p className={`text-xl print:text-lg font-bold ${
                    overallGrade === "FAIL" 
                      ? "text-red-600" 
                      : "text-purple-600"
                  }`}>
                    {overallGrade}
                  </p>
                  <Badge 
                    variant={overallGrade === "FAIL" ? "destructive" : "secondary"}
                    className={`${
                      overallGrade === "FAIL" 
                        ? "bg-red-500 text-white print:bg-transparent print:border print:border-red-500 print:text-red-500" 
                        : getGradeColor(overallGrade) + " print:bg-transparent print:border print:border-current"
                    } mt-1 text-xs print:text-xs`}
                  >
                    {overallGrade === "FAIL" ? (
                      <span className="flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1 print:h-2 print:w-2" />
                        FAILED
                      </span>
                    ) : (
                      overallGrade
                    )}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Grading Scale - Compact */}
            <div className="mt-4 print:mt-2 print:text-xs">
              <p className="font-semibold text-gray-600 mb-1 print:text-xs">Grading Scale:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1 text-xs print:text-xs">
                <div className="text-center p-1 bg-gray-50 rounded print:border">A+: 90-100 (5.0)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">A: 85-89 (4.5)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">A-: 80-84 (4.0)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">B+: 75-79 (3.5)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">B: 70-74 (3.0)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">C+: 65-69 (2.5)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">C: 60-64 (2.0)</div>
                <div className="text-center p-1 bg-gray-50 rounded print:border">D: 50-59 (1.0)</div>
                <div className="text-center p-1 bg-red-50 rounded print:border print:bg-transparent">F: Below 50 (0.0)</div>
              </div>
            </div>

            {/* Signatures - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3 border-t pt-4 print:pt-2 mt-4 print:mt-2">
              <div className="text-center">
                <div className="border-b border-gray-300 pb-8 print:pb-6 mb-1"></div>
                <p className="text-xs print:text-xs font-semibold">Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-300 pb-8 print:pb-6 mb-1"></div>
                <p className="text-xs print:text-xs font-semibold">Principal</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-300 pb-8 print:pb-6 mb-1"></div>
                <p className="text-xs print:text-xs font-semibold">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}