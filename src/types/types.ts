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