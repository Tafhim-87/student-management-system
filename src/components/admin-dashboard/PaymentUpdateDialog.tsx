"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/types";

interface Props {
  student: Student;
  onSave: (id: string, paymentAmount: number, hasPaid: boolean) => void;
}

export const PaymentUpdateDialog = ({ student, onSave }: Props) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(student.paymentAmount);
  const [paid, setPaid] = useState(student.hasPaid);

  const handleSubmit = () => {
    onSave(student._id, amount, paid);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment - {student.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="amount">Payment Amount (BDT)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Payment Status</Label>
            <div className="flex items-center space-x-2">
              <Switch checked={paid} onCheckedChange={setPaid} />
              <span>{paid ? "Paid ✅" : "Pending ❌"}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
