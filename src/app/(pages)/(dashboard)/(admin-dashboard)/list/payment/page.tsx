"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PaymentTable } from "@/components/admin-dashboard/PaymentTable";
import { Student } from "@/types/types";
import { Loader2 } from "lucide-react";
// import { toast } from "@/components/ui/use-toast";

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const formatted = res.data.students.map((s: Student) => ({
          _id: s._id,
          name: s.name,
          userName: s.userName,
          roll: s.roll,
          class: s.class,
          section: s.section,
          paymentAmount: s.paymentAmount,
          hasPaid: s.hasPaid,
          createdBy: s.createdBy,
        }));

        setStudents(formatted);
      } catch (err) {
        // toast({ description: "Failed to fetch students" });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleSave = async (_id: string, amount: number, paid: boolean) => {
    try {
      await axios.put(
        `http://localhost:5000/api/payments/${_id}`,
        { paymentAmount: amount, hasPaid: paid },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

    //   toast({ description: "Payment updated successfully ✅" });

      setStudents((prev) =>
        prev.map((s) =>
          s._id === _id ? { ...s, paymentAmount: amount, hasPaid: paid } : s
        )
      );
    } catch (err) {
    //   toast({ description: "Failed to update payment ❌" });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Student Payments</h1>
      <PaymentTable students={students} onSave={handleSave} />
    </div>
  );
}
