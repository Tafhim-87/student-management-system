// // app/result/print-all/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Printer, Download, ArrowLeft, AlertCircle } from "lucide-react";
// import axios from "axios";

// interface Student {
//   _id: string;
//   name: string;
//   roll: string;
//   class: string;
//   section: string;
// }

// interface Result {
//   semester: string;
//   marks: { subject: string; score: number; grade: string; gpa: number }[];
//   totalMarks: number;
//   averageGPA: number;
// }

// interface StudentResult {
//   student: Student;
//   results: Result[];
// }

// export default function PrintAllResultsPage() {
//   const searchParams = useSearchParams();
//   const studentIds = searchParams.get("students")?.split(",") || [];
//   const download = searchParams.get("download") === "true";
  
//   const [studentsWithResults, setStudentsWithResults] = useState<StudentResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (studentIds.length > 0) {
//       fetchAllResults();
//     } else {
//       setError("No student IDs provided");
//       setLoading(false);
//     }
//   }, [studentIds]);

//   const fetchAllResults = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const token = localStorage.getItem("accessToken");
      
//       if (!token) {
//         setError("No access token found");
//         setLoading(false);
//         return;
//       }

//       console.log("Fetching results for student IDs:", studentIds);

//       // Fetch results for each student individually
//       const resultsPromises = studentIds.map(async (studentId) => {
//         try {
//           console.log(`Fetching result for student: ${studentId}`);
//           const response = await axios.get(
//             `${process.env.NEXT_PUBLIC_API_URL}/results/${studentId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//               timeout: 10000, // 10 second timeout
//             }
//           );
          
//           console.log(`Successfully fetched result for ${studentId}:`, response.data);
//           return {
//             student: response.data.student,
//             results: response.data.results || []
//           };
//         } catch (err) {
//           if(err instanceof Error) {
//             console.error(`Error fetching result for ${studentId}:`, err.message);
//           }
//           // Return null for failed requests, we'll filter them out
//           return null;
//         }
//       });

//       const results = await Promise.all(resultsPromises);
//       console.log("All results:", results);
      
//       // Filter out null results and students with no results
//       const validResults = results.filter(result => 
//         result !== null && result.results && result.results.length > 0
//       ) as StudentResult[];
      
//       console.log("Valid results:", validResults);
//       setStudentsWithResults(validResults);
      
//       if (validResults.length === 0) {
//         setError("No results found for the selected students");
//       }
      
//     } catch (err) {
//       console.error("Error in fetchAllResults:", err);
//       setError("Failed to load results data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = () => {
//     window.print();
//   };

//   const handleRetry = () => {
//     fetchAllResults();
//   };

//   const handleClose = () => {
//     window.close();
//   };

//   const getGradeColor = (grade: string) => {
//     switch (grade) {
//       case "A+": return "bg-green-100 text-green-800";
//       case "A": return "bg-green-50 text-green-700";
//       case "A-": return "bg-blue-100 text-blue-800";
//       case "B+": return "bg-blue-50 text-blue-700";
//       case "B": return "bg-yellow-100 text-yellow-800";
//       case "C+": return "bg-orange-100 text-orange-800";
//       case "C": return "bg-orange-50 text-orange-700";
//       case "D": return "bg-red-100 text-red-800";
//       case "F": return "bg-red-500 text-white";
//       default: return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getOverallGrade = (gpa: number, marks: any[]) => {
//     const hasFailedSubject = marks.some((mark: any) => mark.grade === "F");
//     if (hasFailedSubject) return "FAIL";
    
//     if (gpa >= 4.5) return "A+";
//     if (gpa >= 4.0) return "A";
//     if (gpa >= 3.5) return "B+";
//     if (gpa >= 3.0) return "B";
//     if (gpa >= 2.5) return "C+";
//     if (gpa >= 2.0) return "C";
//     if (gpa >= 1.0) return "D";
//     return "F";
//   };

//   // Auto print after loading if download is true
//   useEffect(() => {
//     if (!loading && download && studentsWithResults.length > 0) {
//       const timer = setTimeout(() => {
//         window.print();
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [loading, download, studentsWithResults.length]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <Card className="w-full max-w-md mx-4">
//           <CardContent className="pt-6 text-center">
//             <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Results</h2>
//             <p className="text-gray-600">Fetching student results...</p>
//             <div className="mt-4 text-sm text-gray-500">
//               <p>Loading {studentIds.length} students</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <Card className="w-full max-w-md mx-4">
//           <CardContent className="pt-6 text-center">
//             <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
//             <p className="text-red-500 mb-4">{error}</p>
//             <div className="flex gap-2 justify-center">
//               <Button onClick={handleRetry} variant="outline">
//                 Try Again
//               </Button>
//               <Button onClick={handleClose}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Close
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (studentsWithResults.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <Card className="w-full max-w-md mx-4">
//           <CardContent className="pt-6 text-center">
//             <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
//             <p className="text-gray-600 mb-4">No results were found for the selected students.</p>
//             <Button onClick={handleClose}>
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Close
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 print:bg-white">
//       {/* Header with Controls - Hidden during print */}
//       <div className="bg-white border-b print:hidden">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">All Student Results</h1>
//               <p className="text-gray-600">
//                 {studentsWithResults.length} students • {" "}
//                 {studentsWithResults.reduce((total, studentData) => total + studentData.results.length, 0)} results
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <Button 
//                 onClick={handleDownload} 
//                 variant="outline"
//                 className="flex items-center gap-2"
//               >
//                 <Download className="h-4 w-4" />
//                 Download PDF
//               </Button>
//               <Button 
//                 onClick={handlePrint}
//                 className="flex items-center gap-2"
//               >
//                 <Printer className="h-4 w-4" />
//                 Print All
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Results Content */}
//       <div className="container mx-auto px-4 py-8 print:py-2 print:px-0">
//         {studentsWithResults.map((studentData) => (
//           <div key={studentData.student._id}>
//             {studentData.results.map((result, resultIndex) => {
//               const overallGrade = getOverallGrade(result.averageGPA, result.marks);
              
//               return (
//                 <Card 
//                   key={`${studentData.student._id}-${resultIndex}`} 
//                   className="w-full max-w-4xl mx-auto mb-6 print:mb-4 print:shadow-none print:border print:border-gray-200 print:break-inside-avoid"
//                 >
//                   <CardContent className="p-6 print:p-4">
//                     {/* Header */}
//                     <div className="text-center border-b pb-4 print:pb-2 mb-4 print:mb-2">
//                       <h2 className="text-2xl print:text-xl font-bold text-gray-900 mb-2">
//                         ACADEMIC TRANSCRIPT
//                       </h2>
//                       <div className="text-sm print:text-xs text-gray-600">
//                         <p className="font-semibold">Springfield International School</p>
//                       </div>
//                     </div>

//                     {/* Student Info */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 print:text-sm mb-4 print:mb-2">
//                       <div className="space-y-2">
//                         <div className="flex">
//                           <span className="font-semibold w-32">Student Name:</span>
//                           <span>{studentData.student.name}</span>
//                         </div>
//                         <div className="flex">
//                           <span className="font-semibold w-32">Roll Number:</span>
//                           <span>{studentData.student.roll}</span>
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <div className="flex">
//                           <span className="font-semibold w-32">Class:</span>
//                           <span>{studentData.student.class}</span>
//                         </div>
//                         <div className="flex">
//                           <span className="font-semibold w-32">Semester:</span>
//                           <span>{result.semester}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Marks Table */}
//                     <div className="mb-4 print:mb-2">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead className="w-12">#</TableHead>
//                             <TableHead>Subject</TableHead>
//                             <TableHead className="text-center">Score</TableHead>
//                             <TableHead className="text-center">Grade</TableHead>
//                             <TableHead className="text-center">GPA</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {result.marks.map((mark: { subject: string; score: number; grade: string; gpa: number }, index: number) => (
//                             <TableRow key={mark.subject}>
//                               <TableCell className="font-medium">{index + 1}</TableCell>
//                               <TableCell className="font-medium">{mark.subject}</TableCell>
//                               <TableCell className="text-center font-semibold">{mark.score}</TableCell>
//                               <TableCell className="text-center">
//                                 <Badge className={`${getGradeColor(mark.grade)} print:bg-transparent print:border`}>
//                                   {mark.grade}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell className="text-center font-semibold">{mark.gpa}</TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>

//                     {/* Summary */}
//                     <div className="grid grid-cols-3 gap-4 print:gap-2 print:text-sm border-t pt-4 print:pt-2">
//                       <div className="text-center">
//                         <p className="font-semibold text-gray-600">Total Marks</p>
//                         <p className="text-xl print:text-lg font-bold text-blue-600">
//                           {result.totalMarks}
//                         </p>
//                       </div>
//                       <div className="text-center">
//                         <p className="font-semibold text-gray-600">Average GPA</p>
//                         <p className="text-xl print:text-lg font-bold text-green-600">
//                           {result.averageGPA}
//                         </p>
//                       </div>
//                       <div className="text-center">
//                         <p className="font-semibold text-gray-600">Overall Grade</p>
//                         <p className={`text-xl print:text-lg font-bold ${
//                           overallGrade === "FAIL" ? "text-red-600" : "text-purple-600"
//                         }`}>
//                           {overallGrade}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page