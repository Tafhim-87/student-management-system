"use client";

import { Student } from "@/types/types";
import { PaymentRow } from "./PaymentRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface Props {
  students: Student[];
  onSave: (id: string, paymentAmount: number, hasPaid: boolean) => void;
}

export const PaymentTable = ({ students, onSave }: Props) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Roll</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <PaymentRow key={student._id} student={student} onSave={onSave} />
          ))}
        </TableBody>
        {/*  total amount */}
        <TableFooter>
          <TableRow>
            <TableHead colSpan={3} className="text-right">
              Total Amount:
            </TableHead>
            <TableHead colSpan={3}>
              {students.reduce((acc, student) => acc + student.paymentAmount, 0)}
            </TableHead>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
