'use client';

import { Users, Mail, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TeacherListProps {
  teachers: User[];
}

export default function TeacherList({ teachers }: TeacherListProps) {
  if (!teachers || teachers.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No teachers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {teachers.map((teacher) => (
        <Card key={teacher._id} className="p-3">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">
                  {teacher.firstName} {teacher.lastName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Mail className="h-3 w-3" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {new Date(teacher.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                {teacher.role}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}