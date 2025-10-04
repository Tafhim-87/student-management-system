"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef(null);

  // Fetch student results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Replace with actual studentId or get from params/context
        const studentId = "68d43a3fd515fec2538827e8"; // Example studentId
        const response = await axios.get(
          `http://localhost:5000/api/results/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        setResults(response.data.results);
        setStudent(response.data.student);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching results:", error.response?.data || error.message);
        toast.error(`❌ Error: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Results_${student?.name || "Student"}`,
    onAfterPrint: () => toast.success("✅ Results printed successfully"),
  });

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!results || !student) {
    return <div className="text-center mt-10">No results found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Student Results</h1>

      {/* Printable Area */}
      <div ref={componentRef} className="p-6 bg-white shadow-md rounded-lg print:shadow-none print:p-0">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{student.name}</h2>
          <p className="text-gray-600">
            Roll: {student.roll} | Class: {student.class} | Section: {student.section || "N/A"}
          </p>
          <p className="text-gray-600">Semester: {results.semester}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Subject</th>
              <th className="border border-gray-300 p-2 text-left">Score</th>
              <th className="border border-gray-300 p-2 text-left">Grade</th>
              <th className="border border-gray-300 p-2 text-left">GPA</th>
            </tr>
          </thead>
          <tbody>
            {results.marks.map((mark, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{mark.subject}</td>
                <td className="border border-gray-300 p-2">{mark.score}</td>
                <td className="border border-gray-300 p-2">{mark.grade}</td>
                <td className="border border-gray-300 p-2">{mark.gpa.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4">
          <p className="font-semibold">Total Marks: {results.totalMarks}</p>
          <p className="font-semibold">Average GPA: {results.averageGPA}</p>
        </div>
      </div>

      {/* Print Button (Hidden in Print View) */}
      <div className="mt-6 text-center print:hidden">
        <Button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600">
          Print Results
        </Button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ResultsPage;