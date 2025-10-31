"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Student } from "@/types/types";
import { Loader2, Edit, Save, X, DollarSign, Calendar, Clock } from "lucide-react";
// import { toast } from "@/components/ui/use-toast";

// Extended Student type to include new payment fields
interface StudentWithPaymentInfo extends Student {
  daysLeft?: number;
  isOverdue?: boolean;
  nextPaymentDue?: string;
  lastPaymentDate?: string;
  isEditing?: boolean;
  tempAmount?: number;
}

export default function PaymentsPage() {
  const [students, setStudents] = useState<StudentWithPaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://localhost:5000/api/student", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch individual payment details for each student
        const studentsWithPaymentInfo = await Promise.all(
          res.data.students.map(async (s: Student) => {
            try {
              // Get detailed payment info including days left
              const paymentRes = await axios.get(
                `http://localhost:5000/api/payments/${s._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              return {
                _id: s._id,
                name: s.name,
                userName: s.userName,
                roll: s.roll,
                class: s.class,
                section: s.section,
                paymentAmount: s.paymentAmount,
                hasPaid: paymentRes.data.student.hasPaid,
                createdBy: s.createdBy,
                daysLeft: paymentRes.data.student.daysLeft,
                isOverdue: paymentRes.data.student.isOverdue,
                nextPaymentDue: paymentRes.data.student.nextPaymentDue,
                lastPaymentDate: paymentRes.data.student.lastPaymentDate,
                isEditing: false,
                tempAmount: s.paymentAmount || 0,
              };
            } catch (error) {
              console.error(`Error fetching payment info for student ${s._id}:`, error);
              return {
                _id: s._id,
                name: s.name,
                userName: s.userName,
                roll: s.roll,
                class: s.class,
                section: s.section,
                paymentAmount: s.paymentAmount,
                hasPaid: s.hasPaid,
                createdBy: s.createdBy,
                daysLeft: 0,
                isOverdue: true,
                nextPaymentDue: new Date().toISOString(),
                isEditing: false,
                tempAmount: s.paymentAmount || 0,
              };
            }
          })
        );

        setStudents(studentsWithPaymentInfo);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        // toast({ 
        //   variant: "destructive",
        //   description: "Failed to fetch students" 
        // });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleSavePayment = async (_id: string, amount: number, paid: boolean) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/payments/${_id}`,
        { paymentAmount: amount, hasPaid: paid },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // toast({ description: "Payment updated successfully ✅" });

      setStudents((prev) =>
        prev.map((s) =>
          s._id === _id 
            ? { 
                ...s, 
                paymentAmount: amount, 
                hasPaid: paid,
                daysLeft: response.data.student.daysLeft,
                isOverdue: response.data.student.isOverdue,
                nextPaymentDue: response.data.student.nextPaymentDue,
                lastPaymentDate: response.data.student.lastPaymentDate,
                isEditing: false,
              } 
            : s
        )
      );
    } catch (err) {
      console.error("Payment update error:", err);
      // toast({
      //   variant: "destructive",
      //   description: "Failed to update payment"
      // });
    }
  };

  const handleToggleEdit = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s._id === studentId
          ? {
              ...s,
              isEditing: !s.isEditing,
              tempAmount: s.paymentAmount || 0,
            }
          : s
      )
    );
  };

  const handleCancelEdit = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s._id === studentId
          ? {
              ...s,
              isEditing: false,
              tempAmount: s.paymentAmount || 0,
            }
          : s
      )
    );
  };

  const handleAmountChange = (studentId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setStudents(prev =>
      prev.map(s =>
        s._id === studentId
          ? { ...s, tempAmount: amount }
          : s
      )
    );
  };

  const handleSaveAmount = async (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const newAmount = student.tempAmount || 0;
    await handleSavePayment(studentId, newAmount, student.hasPaid);
  };

  const handleTogglePaymentStatus = async (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    await handleSavePayment(studentId, student.paymentAmount || 0, !student.hasPaid);
  };

  // Function to get payment status badge color
  const getPaymentStatusColor = (student: StudentWithPaymentInfo) => {
    if (student.isOverdue) return "bg-red-100 text-red-800";
    if (student.hasPaid) return "bg-green-100 text-green-800";
    if (student.daysLeft && student.daysLeft <= 7) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Function to get payment status text
  const getPaymentStatusText = (student: StudentWithPaymentInfo) => {
    if (student.isOverdue) return "Overdue";
    if (student.hasPaid) return `Paid (${student.daysLeft} days left)`;
    if (student.daysLeft && student.daysLeft > 0) return `Due in ${student.daysLeft} days`;
    return "Pending";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Student Payments</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            30-day payment cycle • Auto-resets after due date
          </p>
        </div>
        
        {/* Payment Status Legend */}
        <div className="flex gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
            <span>Due Soon</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <span>Overdue</span>
          </div>
        </div>
      </div>

      {/* Payment Summary - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-xs sm:text-sm text-gray-600">Total Students</div>
          <div className="text-lg sm:text-2xl font-bold">{students.length}</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-xs sm:text-sm text-gray-600">Total Revenue</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            ${students.reduce((sum, s) => sum + (s.paymentAmount || 0), 0)}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-xs sm:text-sm text-gray-600">Paid</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {students.filter(s => s.hasPaid).length}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {students.filter(s => !s.hasPaid).length}
          </div>
        </div>
      </div>

      {/* Students List - Mobile Cards & Desktop Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium">Student</th>
                <th className="text-left p-4 font-medium">Class</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Days Left</th>
                <th className="text-left p-4 font-medium">Next Due</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.userName}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    {student.class} - {student.section}
                  </td>
                  <td className="p-4">
                    {student.isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={student.tempAmount || 0}
                          onChange={(e) => handleAmountChange(student._id, e.target.value)}
                          className="w-24 px-2 py-1 border rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${student.paymentAmount || 0}</span>
                        <button
                          onClick={() => handleToggleEdit(student._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit amount"
                        >
                          <Edit className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(student)}`}>
                      {getPaymentStatusText(student)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`font-medium ${
                      student.daysLeft === 0 ? 'text-red-600' : 
                      student.daysLeft && student.daysLeft <= 3 ? 'text-orange-600' : 
                      'text-gray-600'
                    }`}>
                      {student.daysLeft ?? 0} days
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {student.nextPaymentDue ? 
                      new Date(student.nextPaymentDue).toLocaleDateString() : 
                      'N/A'
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {student.isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveAmount(student._id)}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Save amount"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancelEdit(student._id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Cancel edit"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleTogglePaymentStatus(student._id)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            student.hasPaid 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {student.hasPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {students.map((student) => (
            <div key={student._id} className="border-b p-4">
              {/* Student Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-base">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.userName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {student.class} - {student.section}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(student)}`}>
                  {student.hasPaid ? 'Paid' : 'Pending'}
                </span>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    {student.isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={student.tempAmount || 0}
                          onChange={(e) => handleAmountChange(student._id, e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">${student.paymentAmount || 0}</span>
                        <button
                          onClick={() => handleToggleEdit(student._id)}
                          className="p-1 hover:bg-gray-100 rounded ml-1"
                        >
                          <Edit className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Days Left</div>
                    <div className={`font-medium ${
                      student.daysLeft === 0 ? 'text-red-600' : 
                      student.daysLeft && student.daysLeft <= 3 ? 'text-orange-600' : 
                      'text-gray-600'
                    }`}>
                      {student.daysLeft ?? 0} days
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="text-xs text-gray-600">
                  Next due: {student.nextPaymentDue ? 
                    new Date(student.nextPaymentDue).toLocaleDateString() : 
                    'N/A'
                  }
                </div>
              </div>

              {/* Actions - Always visible on mobile */}
              <div className="flex gap-2 pt-2 border-t">
                {student.isEditing ? (
                  <>
                    <button
                      onClick={() => handleSaveAmount(student._id)}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancelEdit(student._id)}
                      className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleTogglePaymentStatus(student._id)}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
                      student.hasPaid 
                        ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {student.hasPaid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students found
          </div>
        )}
      </div>

      {/* Quick Actions - Mobile */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2 text-sm">Quick Actions</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• <strong>Tap edit icon</strong> to change amount</div>
          <div>• <strong>Tap Mark Paid/Unpaid</strong> to toggle status</div>
          <div>• Payments auto-reset every 30 days</div>
        </div>
      </div>
    </div>
  );
}