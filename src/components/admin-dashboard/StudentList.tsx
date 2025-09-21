// components/StudentList.tsx
'use client';

import { GraduationCap, User, Hash, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Student {
  _id: string;
  name: string;
  userName: string;
  roll: string;
  class: string;
  section?: string;
  createdAt: string;
}

interface StudentListProps {
  students: Student[];
}

export default function StudentList({ students }: StudentListProps) {
  if (!students || students.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No students found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {students.map((student) => (
        <Card key={student._id} className="p-3">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{student.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <User className="h-3 w-3" />
                  <span>@{student.userName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Hash className="h-3 w-3" />
                  <span>Roll: {student.roll}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Class {student.class}{student.section && `-${student.section}`}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}