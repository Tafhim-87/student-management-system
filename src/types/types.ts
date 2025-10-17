// types/result.ts
export interface Student {
  _id: string;
  name: string;
  roll: number;
  class: string;
  section: string;
}

export interface Mark {
  subject: string;
  score: number;
  grade: string;
  gpa: number;
}

export interface Result {
  _id: string;
  semester: string;
  marks: Mark[];
  totalMarks: number;
  averageGPA: number;
  createdAt: string;
}

export interface ResultResponse {
  student: Student;
  results: Result;
}

export interface Student {
  _id: string;
  name: string;
  userName: string;
  roll: number;
  class: string;
  section: string;
  paymentAmount: number;
  hasPaid: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  assignedClasses: Array<{
    class: string;
    section: string;
    subject?: string;
  }>;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TeachersResponse {
  message: string;
  teachers: Teacher[];
  userRole: string;
}