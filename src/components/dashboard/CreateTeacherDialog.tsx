// components/dashboard/CreateTeacherDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useApi from "@/hooks/useApi";

interface Teacher {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  assignedClasses: { class: string; section: string }[];
}

interface CreateTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherCreated?: (teacher: Teacher) => void;
}

interface ClassAssignment {
  class: string;
  section: string;
}

export default function CreateTeacherDialog({ 
  open, 
  onOpenChange, 
  onTeacherCreated 
}: CreateTeacherDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [assignedClasses, setAssignedClasses] = useState<ClassAssignment[]>([
    { class: "", section: "" }
  ]);
  const { post, loading, error } = useApi();

  // Available classes and sections
  const availableClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const availableSections = ["A", "B", "C", "D", "E"];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      setAssignedClasses([{ class: "", section: "" }]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate assigned classes
    const validClasses = assignedClasses.filter(cls => 
      cls.class && cls.section
    );
    
    if (validClasses.length === 0) {
      alert("Please add at least one valid class assignment");
      return;
    }

    const payload = {
      ...formData,
      assignedClasses: validClasses
    };

    const data = await post("/teacher/create", payload) as {user: { firstName: string; lastName: string; email: string; password: string; assignedClasses: { class: string; section: string }[]}} | null;
    if (data) {
      if (onTeacherCreated) {
        onTeacherCreated(data.user);
      }
      onOpenChange(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      setAssignedClasses([{ class: "", section: "" }]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (index: number, field: keyof ClassAssignment, value: string) => {
    const updatedClasses = [...assignedClasses];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setAssignedClasses(updatedClasses);
  };

  const addClassAssignment = () => {
    setAssignedClasses([...assignedClasses, { class: "", section: "" }]);
  };

  const removeClassAssignment = (index: number) => {
    if (assignedClasses.length > 1) {
      const updatedClasses = assignedClasses.filter((_, i) => i !== index);
      setAssignedClasses(updatedClasses);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Teacher</DialogTitle>
          <DialogDescription>
            Add a new teacher to the system. Assign them to one or more classes and sections.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Class Assignments */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Class Assignments *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addClassAssignment}
              >
                + Add Class
              </Button>
            </div>
            
            {assignedClasses.map((classItem, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`class-${index}`} className="text-sm">
                    Class {index + 1}
                  </Label>
                  <Select
                    value={classItem.class}
                    onValueChange={(value) => handleClassChange(index, "class", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`section-${index}`} className="text-sm">
                    Section {index + 1}
                  </Label>
                  <Select
                    value={classItem.section}
                    onValueChange={(value) => handleClassChange(index, "section", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((section) => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {assignedClasses.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeClassAssignment(index)}
                    className="mb-2"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            
            <p className="text-xs text-gray-500">
              Teacher will be able to view and manage students in these classes
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                "Create Teacher"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}