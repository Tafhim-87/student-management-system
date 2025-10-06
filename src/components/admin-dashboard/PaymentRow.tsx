"use client";

import { Student } from "@/types/types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentUpdateDialog } from "./PaymentUpdateDialog";

interface Props {
  student: Student;
  onSave: (id: string, paymentAmount: number, hasPaid: boolean) => void;
}

export const PaymentRow = ({ student, onSave }: Props) => {
  return (
    <tr className="border-b">
      <td className="p-4">{student.name}</td>
      <td className="p-4">{student.roll}</td>
      <td className="p-4">
        {student.class}-{student.section}
      </td>
      <td className="p-4">{student.paymentAmount} BDT</td>
      <td className="p-4">
        <PaymentStatusBadge hasPaid={student.hasPaid} />
      </td>
      <td className="p-4">
        <PaymentUpdateDialog student={student} onSave={onSave} />
      </td>
    </tr>
  );
};
